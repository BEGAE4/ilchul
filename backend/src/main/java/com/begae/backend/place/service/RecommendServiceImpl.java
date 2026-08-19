package com.begae.backend.place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.place.client.WellnessApiClient;
import com.begae.backend.place.component.*;
import com.begae.backend.place.dto.*;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendServiceImpl implements RecommendService {

    private static final DateTimeFormatter SURVEY_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final int WELLNESS_MATCH_RADIUS_M = 1000;

    @Value("${anthropic-api.api-key}")
    private String anthropicApiKey;

    private final SurveySearchPolicy searchPolicy;
    private final WellnessApiClient wellnessApiClient;
    private final WellnessMatcher wellnessMatcher;
    private final CandidateMerger candidateMerger;
    private final AiSelectionValidator selectionValidator;
    private final PlaceService placeService;
    private final PromptRegistry promptRegistry;
    private final ObjectMapper objectMapper;

    @Override
    public RecommendResponseDto recommend(SurveyResultDto survey) {
        int totalHours = totalHours(survey);
        double x = survey.getLocation().getX();
        double y = survey.getLocation().getY();
        int radiusM = searchPolicy.radiusMeters(survey.getTransport(), totalHours);

        List<PlaceCandidate> wellnessCandidates = collectWellness(x, y, radiusM);
        List<PlaceCandidate> kakaoCandidates = collectKakao(survey.getEmotion(), x, y, radiusM);
        List<PlaceCandidate> candidates = candidateMerger.merge(wellnessCandidates, kakaoCandidates);

        AiSelectionDto ai = callAi(toSurveyJson(survey), toCandidateList(candidates));
        List<AiSelectionDto.Selection> selections = selectionValidator.validate(ai, candidates.size());

        if (selections.isEmpty()) {
            throw new CustomException(PlaceErrorCode.RECOMMEND_NO_RESULT);
        }

        List<RecommendResponseDto.Item> items = new ArrayList<>();
        for (AiSelectionDto.Selection s : selections) {
            PlaceCandidate picked = candidates.get(s.getIndex());
            SearchPlaceResponseDto enriched =
                    placeService.enrichAndUpsert(picked.getDocument(), picked.getWellnessContentId());
            items.add(RecommendResponseDto.Item.builder()
                    .order(s.getOrder())
                    .placeId(enriched.getPlaceId())
                    .placeName(enriched.getPlaceName())
                    .categoryName(enriched.getCategoryName())
                    .placeImageUrl(enriched.getPlaceImageUrl())
                    .roadAddressName(picked.getDocument().getRoadAddressName())
                    .x(enriched.getX())
                    .y(enriched.getY())
                    .stayMinutes(s.getStayMinutes())
                    .reason(s.getReason())
                    .tags(s.getTags())
                    .wellnessCertified(picked.isWellness())
                    .build());
        }

        return RecommendResponseDto.builder()
                .recommendId("rc_" + UUID.randomUUID().toString().substring(0, 8))
                .candidateCount(RecommendResponseDto.CandidateCount.builder()
                        .wellness(wellnessCandidates.size())
                        .kakao(candidates.size() - wellnessCandidates.size())
                        .build())
                .plan(toPlan(ai, totalHours, items.size()))
                .items(items)
                .build();
    }

    /**
     * 웰니스 장소를 카카오 POI로 되찾는다.
     * 정책상 웰니스 콘텐츠를 저장할 수 없으므로, 카카오에서 같은 장소를 찾지 못하면 후보에서 뺀다.
     */
    private List<PlaceCandidate> collectWellness(double x, double y, int radiusM) {
        List<PlaceCandidate> result = new ArrayList<>();
        for (WellnessPlaceDto w : wellnessApiClient.findNearby(x, y, radiusM)) {
            List<KakaoPlaceResponseDto.Document> found = placeService.searchRawByKeyword(
                    w.getTitle(), w.getX(), w.getY(), WELLNESS_MATCH_RADIUS_M);
            wellnessMatcher.nearest(w.getX(), w.getY(), found)
                    .ifPresentOrElse(
                            doc -> result.add(new PlaceCandidate(doc, w.getContentId())),
                            () -> log.info("웰니스 장소를 카카오에서 찾지 못해 제외한다: contentId={}, title={}",
                                    w.getContentId(), w.getTitle()));
        }
        return result;
    }

    private List<PlaceCandidate> collectKakao(String emotion, double x, double y, int radiusM) {
        List<PlaceCandidate> result = new ArrayList<>();
        for (String keyword : searchPolicy.keywordsFor(emotion)) {
            for (KakaoPlaceResponseDto.Document doc : placeService.searchRawByKeyword(keyword, x, y, radiusM)) {
                result.add(new PlaceCandidate(doc, null));
            }
        }
        return result;
    }

    private int totalHours(SurveyResultDto survey) {
        LocalDateTime start = LocalDateTime.parse(survey.getStartTime(), SURVEY_TIME);
        LocalDateTime end = LocalDateTime.parse(survey.getEndTime(), SURVEY_TIME);
        return (int) Math.max(1, Duration.between(start, end).toHours());
    }

    private RecommendResponseDto.Plan toPlan(AiSelectionDto ai, int totalHours, int itemCount) {
        AiSelectionDto.TravelPlan p = ai != null ? ai.getTravelPlan() : null;
        return RecommendResponseDto.Plan.builder()
                .totalHours(p != null && p.getTotalHours() > 0 ? p.getTotalHours() : totalHours)
                .estimatedPlaceCount(itemCount)
                .reasoning(p != null ? p.getReasoning() : null)
                .build();
    }

    private String toCandidateList(List<PlaceCandidate> candidates) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < candidates.size(); i++) {
            PlaceCandidate c = candidates.get(i);
            sb.append("[").append(i).append("] ");
            if (c.isWellness()) sb.append("[WELLNESS] ");
            sb.append(c.getDocument().getPlaceName())
              .append(" | ").append(c.getDocument().getCategoryName())
              .append(" | ").append(c.getDocument().getRoadAddressName())
              .append("\n");
        }
        return sb.toString();
    }

    String toSurveyJson(SurveyResultDto survey) {
        try {
            return objectMapper.writeValueAsString(survey);
        } catch (JsonProcessingException e) {
            log.error("설문 직렬화 실패", e);
            throw new CustomException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // Task 8에서 PlaceServiceImpl의 Anthropic 호출 코드를 옮겨 채운다.
    // 이 태스크의 테스트는 callAi를 spy로 가로채므로 아직 비어 있어도 통과한다.
    AiSelectionDto callAi(String surveyJson, String candidateList) {
        throw new UnsupportedOperationException("Task 8에서 구현한다");
    }
}
