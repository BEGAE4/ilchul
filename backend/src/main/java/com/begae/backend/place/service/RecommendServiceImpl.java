package com.begae.backend.place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.place.client.AnthropicRecommendationClient;
import com.begae.backend.place.client.WellnessApiClient;
import com.begae.backend.place.component.*;
import com.begae.backend.place.dto.*;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.begae.backend.trip.*;
import com.begae.backend.plan.dto.DeparturePointDto;
import com.begae.backend.plan_place.dto.Point;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendServiceImpl implements RecommendService {

    private static final DateTimeFormatter SURVEY_TIME = DateTimeFormatter
            .ofPattern("uuuu-MM-dd HH:mm")
            .withResolverStyle(ResolverStyle.STRICT);
    private static final int WELLNESS_MATCH_RADIUS_M = 1000;
    private static final int EXTERNAL_CALL_CONCURRENCY = 4;
    private static final int ENRICH_CONCURRENCY = 3;
    private static final Duration RECOMMEND_TIMEOUT = Duration.ofSeconds(90);
    private static final Duration WELLNESS_STAGE_TIMEOUT = Duration.ofSeconds(15);
    private static final Duration KAKAO_STAGE_TIMEOUT = Duration.ofSeconds(15);
    private static final Duration AI_STAGE_TIMEOUT = Duration.ofSeconds(40);
    private static final Duration ENRICH_STAGE_TIMEOUT = Duration.ofSeconds(20);
    private static final Set<String> SUPPORTED_TRANSPORTS = Set.of("도보", "대중교통", "자가용");

    private final SurveySearchPolicy searchPolicy;
    private final WellnessApiClient wellnessApiClient;
    private final WellnessMatcher wellnessMatcher;
    private final CandidateMerger candidateMerger;
    private final AiSelectionValidator selectionValidator;
    private final PlaceService placeService;
    private final ObjectMapper objectMapper;
    private final AnthropicRecommendationClient recommendationClient;
    private final TripRouteCalculator routeCalculator;

    @Override
    public RecommendResponseDto recommend(SurveyResultDto survey) {
        long deadlineNanos = System.nanoTime() + RECOMMEND_TIMEOUT.toNanos();
        SurveyWindow window = validateSurvey(survey);
        double x = survey.getLocation().getX();
        double y = survey.getLocation().getY();
        int radiusM = searchPolicy.radiusMeters(survey.getTransport(), window.totalHours());

        WellnessCollection wellness = collectWellness(
                x, y, radiusM, boundedTimeout(deadlineNanos, WELLNESS_STAGE_TIMEOUT));
        List<PlaceCandidate> kakaoCandidates = collectKakao(
                survey.getEmotion(), x, y, radiusM,
                boundedTimeout(deadlineNanos, KAKAO_STAGE_TIMEOUT));
        Integer travelLimit = TripTimePolicy.travelLimit(survey.getTransportTime());
        List<PlaceCandidate> candidates = candidateMerger.merge(wellness.candidates(), kakaoCandidates).stream()
                .filter(this::usableCandidate)
                .filter(c -> TripTimePolicy.fits(routeCalculator.estimate(departure(survey),
                        List.of(point(c)), List.of(30), survey.getTransport()), window.totalMinutes(), travelLimit))
                .limit(24).toList();

        if (candidates.isEmpty()) {
            throw new CustomException(PlaceErrorCode.RECOMMEND_NO_RESULT);
        }

        String surveyJson = toSurveyJson(survey);
        String candidateJson = toCandidateList(candidates, survey);
        long aiDeadline = Math.min(deadlineNanos, System.nanoTime() + AI_STAGE_TIMEOUT.toNanos());
        AiSelectionDto ai;
        try { ai = callAi(surveyJson, candidateJson, boundedTimeout(aiDeadline, AI_STAGE_TIMEOUT)); }
        catch (CustomException exception) {
            if (exception.getErrorCode() != PlaceErrorCode.RECOMMENDATION_INVALID_RESPONSE) throw exception;
            ai = null;
        }
        boolean needsCorrection = selectionValidator.needsCorrection(ai, candidates.size());
        List<AiSelectionDto.Selection> selections = selectionValidator.validate(ai, candidates.size(), window.totalMinutes());
        boolean timeInvalid = selections.isEmpty() || !TripTimePolicy.fits(estimate(survey, candidates, selections), window.totalMinutes(), travelLimit);
        boolean changed = needsCorrection || timeInvalid;
        if (changed && aiDeadline - System.nanoTime() > Duration.ofSeconds(2).toNanos()) {
            recommendationClient.recordQuality("correction");
            try {
                var correctionSurvey = objectMapper.readTree(surveyJson).deepCopy();
                ((com.fasterxml.jackson.databind.node.ObjectNode) correctionSurvey).put("correction",
                        "Regenerate: valid unique candidate indices, contiguous order, complete friendly ~요 sentences within length limits, and travel + stays including return within both budgets. Fewer stops are allowed.");
                ai = callAi(objectMapper.writeValueAsString(correctionSurvey), candidateJson,
                        boundedTimeout(aiDeadline, AI_STAGE_TIMEOUT));
                changed = selectionValidator.needsCorrection(ai, candidates.size());
                selections = selectionValidator.validate(ai, candidates.size(), window.totalMinutes());
            } catch (CustomException | JsonProcessingException exception) {
                recommendationClient.recordQuality("correction_failed");
                // The first selection still goes through the same server checks and complete-sentence fallback.
            }
        }
        selections = new ArrayList<>(selections);
        while (!selections.isEmpty() && !TripTimePolicy.fits(estimate(survey, candidates, selections), window.totalMinutes(), travelLimit)) {
            selections.removeLast();
            changed = true;
            recommendationClient.recordQuality("course_reduced");
        }
        if (selections.isEmpty()) throw new CustomException(ai == null
                ? PlaceErrorCode.RECOMMENDATION_INVALID_RESPONSE : PlaceErrorCode.RECOMMEND_NO_RESULT);
        TripTimeSummary timeSummary = routeCalculator.calculate(departure(survey),
                selections.stream().map(s -> point(candidates.get(s.getIndex()))).toList(),
                selections.stream().map(AiSelectionDto.Selection::getStayMinutes).toList(), survey.getTransport(),
                boundedTimeout(deadlineNanos, Duration.ofSeconds(10)));
        if (!TripTimePolicy.fits(timeSummary, window.totalMinutes(), travelLimit)) recommendationClient.recordQuality("time_rejected");
        TripTimePolicy.enforce(timeSummary, window.totalMinutes(), travelLimit);
        for (var selection : selections) {
            selection.setReason(RecommendationTextPolicy.reason(
                    "여행 중 잠시 들러볼 장소로 추천해 드려요.".equals(selection.getReason()) ? null : selection.getReason(),
                    candidates.get(selection.getIndex()).getDocument().getCategoryName()));
        }

        List<RecommendResponseDto.Item> items = enrichSelections(
                selections, candidates, boundedTimeout(deadlineNanos, ENRICH_STAGE_TIMEOUT));
        int mergedKakaoCount = Math.toIntExact(candidates.stream()
                .filter(candidate -> !candidate.isWellness())
                .count());

        recommendationClient.recordQuality(timeSummary.estimated() ? "accepted_estimated" : "accepted_routed");
        return RecommendResponseDto.builder()
                .recommendId("rc_" + UUID.randomUUID().toString().substring(0, 8))
                .candidateCount(RecommendResponseDto.CandidateCount.builder()
                        .wellness(wellness.rawCount())
                        .kakao(mergedKakaoCount)
                        .build())
                .plan(toPlan(ai, window.totalHours(), items.size(), changed))
                .timeSummary(timeSummary)
                .items(items)
                .build();
    }

    /**
     * 웰니스 장소를 카카오 POI로 되찾는다.
     * 정책상 웰니스 콘텐츠를 저장할 수 없으므로, 카카오에서 같은 장소를 찾지 못하면 후보에서 뺀다.
     */
    private WellnessCollection collectWellness(
            double x, double y, int radiusM, Duration timeout) {
        List<WellnessPlaceDto> raw = wellnessApiClient.findNearby(x, y, radiusM);
        if (raw.isEmpty()) return new WellnessCollection(0, List.of());

        try {
            List<PlaceCandidate> matched = Flux.fromIterable(raw)
                    .flatMapSequential(this::matchWellnessCandidate, EXTERNAL_CALL_CONCURRENCY)
                    .collectList()
                    .block(timeout);
            return new WellnessCollection(raw.size(), matched != null ? matched : List.of());
        } catch (RuntimeException e) {
            log.warn("웰니스 카카오 매칭 시간이 초과되어 카카오 일반 후보만 사용한다");
            return new WellnessCollection(raw.size(), List.of());
        }
    }

    private Mono<PlaceCandidate> matchWellnessCandidate(WellnessPlaceDto wellness) {
        return Mono.fromCallable(() -> {
                    List<KakaoPlaceResponseDto.Document> found = placeService.searchRawByKeyword(
                            wellness.getTitle(), wellness.getX(), wellness.getY(), WELLNESS_MATCH_RADIUS_M);
                    return wellnessMatcher.nearest(wellness.getTitle(), wellness.getX(), wellness.getY(), found)
                            .map(document -> new PlaceCandidate(document, wellness.getContentId()))
                            .orElseGet(() -> {
                                log.debug("웰니스 동일 장소 매칭 결과 없음");
                                return null;
                            });
                })
                .subscribeOn(Schedulers.boundedElastic())
                .onErrorResume(e -> {
                    log.warn("웰니스 장소의 카카오 매칭 호출이 실패해 제외한다: contentId={}",
                            wellness.getContentId());
                    return Mono.empty();
                });
    }

    private List<PlaceCandidate> collectKakao(
            String emotion, double x, double y, int radiusM, Duration timeout) {
        List<KakaoSearchAttempt> attempts;
        try {
            attempts = Flux.fromIterable(searchPolicy.keywordsFor(emotion))
                    .flatMapSequential(
                            keyword -> searchKakao(keyword, x, y, radiusM),
                            EXTERNAL_CALL_CONCURRENCY)
                    .collectList()
                    .block(timeout);
        } catch (RuntimeException e) {
            log.error("카카오 일반 후보 검색 시간이 초과되었다");
            throw new CustomException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        }

        if (attempts == null || attempts.stream().noneMatch(KakaoSearchAttempt::success)) {
            throw new CustomException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        }

        List<PlaceCandidate> result = new ArrayList<>();
        for (KakaoSearchAttempt attempt : attempts) {
            if (!attempt.success()) continue;
            for (KakaoPlaceResponseDto.Document document : attempt.documents()) {
                result.add(new PlaceCandidate(document, null));
            }
        }
        return result;
    }

    private Mono<KakaoSearchAttempt> searchKakao(
            String keyword, double x, double y, int radiusM) {
        return Mono.fromCallable(() -> new KakaoSearchAttempt(
                        true, placeService.searchRawByKeyword(keyword, x, y, radiusM)))
                .subscribeOn(Schedulers.boundedElastic())
                .onErrorResume(e -> {
                    log.warn("카카오 일반 후보 검색어 호출 실패: keyword={}", keyword);
                    return Mono.just(new KakaoSearchAttempt(false, List.of()));
                });
    }

    private SurveyWindow validateSurvey(SurveyResultDto survey) {
        if (survey == null
                || isBlank(survey.getEmotion())
                || survey.getEmotion().length() > 100
                || (survey.getTransportTime() != null && survey.getTransportTime().length() > 30)
                || isBlank(survey.getStartTime())
                || isBlank(survey.getEndTime())
                || !SUPPORTED_TRANSPORTS.contains(survey.getTransport())
                || survey.getLocation() == null
                || survey.getLocation().getX() == null
                || survey.getLocation().getY() == null
                || !Double.isFinite(survey.getLocation().getX())
                || !Double.isFinite(survey.getLocation().getY())
                || survey.getLocation().getX() < -180 || survey.getLocation().getX() > 180
                || survey.getLocation().getY() < -90 || survey.getLocation().getY() > 90) {
            throw new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE);
        }

        survey.setEmotion(survey.getEmotion().trim());
        TripTimePolicy.travelLimit(survey.getTransportTime());
        try {
            LocalDateTime start = LocalDateTime.parse(survey.getStartTime(), SURVEY_TIME);
            LocalDateTime end = LocalDateTime.parse(survey.getEndTime(), SURVEY_TIME);
            long totalMinutes = Duration.between(start, end).toMinutes();
            if (totalMinutes <= 0 || totalMinutes > Duration.ofHours(24).toMinutes()) {
                throw new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE);
            }
            return new SurveyWindow(
                    (int) Math.max(1, Duration.ofMinutes(totalMinutes).toHours()),
                    Math.toIntExact(totalMinutes));
        } catch (DateTimeParseException e) {
            throw new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE);
        }
    }

    private RecommendResponseDto.Plan toPlan(AiSelectionDto ai, int totalHours, int itemCount, boolean changed) {
        AiSelectionDto.TravelPlan p = ai != null ? ai.getTravelPlan() : null;
        return RecommendResponseDto.Plan.builder()
                .totalHours(totalHours)
                .estimatedPlaceCount(itemCount)
                .reasoning(RecommendationTextPolicy.reasoning(p != null ? p.getReasoning() : null, changed))
                .build();
    }

    private String toCandidateList(List<PlaceCandidate> candidates, SurveyResultDto survey) {
        var data = objectMapper.createObjectNode();
        var entries = data.putArray("places");
        Point origin = new Point("출발지", survey.getLocation().getX(), survey.getLocation().getY());
        for (int i = 0; i < candidates.size(); i++) {
            var c = candidates.get(i);
            var d = c.getDocument();
            var entry = entries.addObject();
            entry.put("index", i).put("name", boundedText(d.getPlaceName()))
                    .put("category", boundedText(d.getCategoryName())).put("address", boundedText(d.getRoadAddressName()))
                    .put("wellness_certified", c.isWellness()).put("x", point(c).x()).put("y", point(c).y())
                    .put("from_departure_minutes", routeCalculator.estimateLeg(origin, point(c), survey.getTransport()))
                    .put("return_minutes", routeCalculator.estimateLeg(point(c), origin, survey.getTransport()));
        }
        var matrix = data.putArray("between_minutes");
        for (var from : candidates) {
            var row = matrix.addArray();
            for (var to : candidates) row.add(routeCalculator.estimateLeg(point(from), point(to), survey.getTransport()));
        }
        data.put("travel_times_estimated", true);
        return data.toString();
    }

    private String boundedText(String value) {
        if (value == null) return "";
        return value.codePointCount(0, value.length()) <= 120 ? value : value.substring(0, value.offsetByCodePoints(0, 120));
    }
    private boolean usableCandidate(PlaceCandidate candidate) {
        try {
            var d = candidate.getDocument();
            TripTimePolicy.validateCoordinates(Double.parseDouble(d.getX()), Double.parseDouble(d.getY()));
            return d.getPlaceName() != null && !d.getPlaceName().isBlank();
        } catch (RuntimeException exception) { return false; }
    }
    private Point point(PlaceCandidate candidate) {
        var d = candidate.getDocument();
        return new Point("후보", Double.parseDouble(d.getX()), Double.parseDouble(d.getY()));
    }
    private DeparturePointDto departure(SurveyResultDto survey) {
        return new DeparturePointDto("출발지", "", survey.getLocation().getX(), survey.getLocation().getY());
    }
    private TripTimeSummary estimate(SurveyResultDto survey, List<PlaceCandidate> candidates, List<AiSelectionDto.Selection> selections) {
        return routeCalculator.estimate(departure(survey), selections.stream().map(s -> point(candidates.get(s.getIndex()))).toList(),
                selections.stream().map(AiSelectionDto.Selection::getStayMinutes).toList(), survey.getTransport());
    }

    String toSurveyJson(SurveyResultDto survey) {
        try {
            var node = objectMapper.valueToTree(survey);
            var object = (com.fasterxml.jackson.databind.node.ObjectNode) node;
            object.put("available_minutes", validateSurvey(survey).totalMinutes());
            Integer limit = TripTimePolicy.travelLimit(survey.getTransportTime());
            if (limit != null) object.put("travel_limit_minutes", limit);
            object.put("return_to_departure", true);
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.error("설문 직렬화 실패", e);
            throw new CustomException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    AiSelectionDto callAi(String surveyJson, String candidateList, Duration timeout) {
        return recommendationClient.select(surveyJson, candidateList, timeout);
    }

    private List<RecommendResponseDto.Item> enrichSelections(
            List<AiSelectionDto.Selection> selections,
            List<PlaceCandidate> candidates,
            Duration timeout) {
        try {
            List<RecommendResponseDto.Item> items = Flux.fromIterable(selections)
                    .flatMapSequential(
                            selection -> Mono.fromCallable(() -> toItem(selection, candidates))
                                    .subscribeOn(Schedulers.boundedElastic()),
                            ENRICH_CONCURRENCY)
                    .collectList()
                    .block(timeout);
            if (items == null) throw new CustomException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
            return items;
        } catch (CustomException e) {
            throw e;
        } catch (RuntimeException e) {
            log.error("추천 장소 상세 보강 시간이 초과되었거나 실패했다");
            throw new CustomException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    private RecommendResponseDto.Item toItem(
            AiSelectionDto.Selection selection, List<PlaceCandidate> candidates) {
        PlaceCandidate picked = candidates.get(selection.getIndex());
        SearchPlaceResponseDto enriched =
                placeService.enrichAndUpsert(picked.getDocument(), picked.getWellnessContentId());
        return RecommendResponseDto.Item.builder()
                .order(selection.getOrder())
                .placeId(enriched.getPlaceId())
                .placeName(enriched.getPlaceName())
                .categoryName(enriched.getCategoryName())
                .placeImageUrl(enriched.getPlaceImageUrl())
                .roadAddressName(picked.getDocument().getRoadAddressName())
                .x(enriched.getX())
                .y(enriched.getY())
                .stayMinutes(selection.getStayMinutes())
                .reason(selection.getReason())
                .tags(selection.getTags())
                .wellnessCertified(picked.isWellness())
                .build();
    }

    private Duration boundedTimeout(long deadlineNanos, Duration stageTimeout) {
        long remainingNanos = deadlineNanos - System.nanoTime();
        if (remainingNanos <= 0) {
            throw new CustomException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        }
        return Duration.ofNanos(Math.min(remainingNanos, stageTimeout.toNanos()));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record SurveyWindow(int totalHours, int totalMinutes) {}

    private record WellnessCollection(int rawCount, List<PlaceCandidate> candidates) {}

    private record KakaoSearchAttempt(
            boolean success, List<KakaoPlaceResponseDto.Document> documents) {}
}
