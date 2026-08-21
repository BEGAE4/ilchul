package com.begae.backend.place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.domain.Place;
import com.begae.backend.place.dto.*;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.dto.PopularPlanItemDto;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan_place.domain.PlanPlace;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PlaceServiceImpl implements PlaceService {

    private final String GOOGLE_FIELDMASK = "places.displayName,places.formattedAddress,places.photos.name";

    private final WebClient kakaoWebClient;
    private final WebClient googleWebClient;
    private final PlaceRepository placeRepository;
    private final PlanRepository planRepository;
    private final PlaceUpsertWriter placeUpsertWriter;

    @Override
    public List<SearchPlaceResponseDto> searchPlaceByKeyword(String keyword) {

        KakaoPlaceResponseDto kakaoResponse = kakaoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/keyword.json")
                        .queryParam("query", keyword)
                        .build())
                .retrieve()
                .bodyToMono(KakaoPlaceResponseDto.class)
                .timeout(Duration.ofMinutes(5))
                .block();
        return getSearchResult(kakaoResponse);
    }

    @Override
    public List<SearchPlaceResponseDto> getSearchResult(KakaoPlaceResponseDto kakaoResponse) {
        List<KakaoPlaceResponseDto.Document> documents = List.of();
        if(kakaoResponse != null) {
            documents = kakaoResponse.getDocuments() != null
                    ? kakaoResponse.getDocuments() : List.of();
        }

        return Flux.fromIterable(documents)
                .flatMap(document -> toPlaceSummary(document, null), 8)
                .collectList()
                .block(Duration.ofSeconds(20));
    }

    @Override
    public Mono<SearchPlaceResponseDto> toPlaceSummary(
            KakaoPlaceResponseDto.Document document, String wellnessContentId) {
        String textQuery = document.getRoadAddressName() + ", " + document.getPlaceName();

        Mono<GooglePlaceResponseDto> googleResponse = googleWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/places:searchText")
                        .build())
                .header("X-Goog-FieldMask", GOOGLE_FIELDMASK)
                .bodyValue(Map.of("textQuery", textQuery, "languageCode", "ko"))
                .retrieve()
                .bodyToMono(GooglePlaceResponseDto.class)
                .timeout(Duration.ofSeconds(10));

        Mono<PlaceSummaryDto> placeSummary = googleResponse.flatMap(response -> {
            String photoName;
            if(response != null && response.getPlaces() != null && !response.getPlaces().isEmpty()) {
                List<GooglePlaceResponseDto.Photo> photos = response.getPlaces().getFirst().getPhotos();
                if(photos != null && !photos.isEmpty()) photoName = photos.getFirst().getName();
                else photoName = null;
            } else photoName = null;

            if(photoName == null) {
                return Mono.just(buildDto(document, null));
            }

           return googleWebClient.get()
                  .uri(uriBuilder -> uriBuilder
                          .path("v1/" + photoName + "/media")
                          .queryParam("maxHeightPx", 300)
                          .queryParam("maxWidthPx", 300)
                          .queryParam("skipHttpRedirect", true)
                          .build())
                  .retrieve()
                  .bodyToMono(GooglePlaceImageResponseDto.class)

                  .timeout(Duration.ofSeconds(10))
                  .map(image -> buildDto(document, image.getPhotoUri()));

        }).onErrorResume(exception -> Mono.just(buildDto(document, null)));

        return placeSummary.flatMap(placeSummaryDto ->
                Mono.fromCallable(() -> upsertPlace(
                                PlaceUpsertCommand.fromKakao(document, placeSummaryDto, wellnessContentId)))
                        .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                        .map(placeId -> SearchPlaceResponseDto.builder()
                                .placeId(placeId)
                                .placeName(placeSummaryDto.getPlaceName())
                                .categoryName(placeSummaryDto.getCategoryName())
                                .placeImageUrl(placeSummaryDto.getPlaceImageUrl())
                                .x(Double.parseDouble(placeSummaryDto.getX()))
                                .y(Double.parseDouble(placeSummaryDto.getY()))
                                .build()));
    }

    private PlaceSummaryDto buildDto(KakaoPlaceResponseDto.Document document, String photoUri) {
        String raw = document.getCategoryName() == null ? "" : document.getCategoryName();
        String[] split = raw.split(">");
        String categoryName = split.length >= 2
                ? split[0].trim() + "· " + split[1].trim()
                : raw.trim();
        return PlaceSummaryDto.builder()
                .categoryName(categoryName)
                .placeName(document.getPlaceName())
                .placeImageUrl(photoUri)
                .x(document.getX())
                .y(document.getY())
                .build();
    }

    @Override
    public List<KakaoPlaceResponseDto.Document> searchRawByKeyword(
            String keyword, double x, double y, int radiusM) {

        KakaoPlaceResponseDto response = kakaoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/keyword.json")
                        .queryParam("query", keyword)
                        .queryParam("radius", radiusM)
                        .queryParam("x", x)
                        .queryParam("y", y)
                        .build())
                .retrieve()
                .bodyToMono(KakaoPlaceResponseDto.class)
                .timeout(Duration.ofSeconds(10))
                .block();

        if (response == null || response.getDocuments() == null) return List.of();
        return response.getDocuments();
    }

    @Override
    public SearchPlaceResponseDto enrichAndUpsert(
            KakaoPlaceResponseDto.Document document, String wellnessContentId) {
        return toPlaceSummary(document, wellnessContentId).block(Duration.ofSeconds(20));
    }

    @Override
    public int upsertPlace(PlaceUpsertCommand command) {
        try {
            return placeUpsertWriter.insertOrMerge(command);
        } catch (DataIntegrityViolationException e) {
            return placeUpsertWriter.mergeAfterConflict(command);
        }
    }

    @Override
    public PlaceDetailResponseDto getPlaceDetail(Integer placeId) {
        Place place = placeRepository.findById(placeId).orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

        return PlaceDetailResponseDto.builder()
                .placeId(place.getPlaceId())
                .placeName(place.getPlaceName())
                .addressName(place.getAddressName())
                .roadAddressName(place.getRoadAddressName())
                .categoryName(place.getCategoryName())
                .phone(place.getPhone())
                .placeUrl(place.getPlaceUrl())
                .placeImageUrl(place.getPlaceImageUrl())
                .x(place.getX())
                .y(place.getY())
                .build();
    }

    private static final double SEARCH_RADIUS_KM = 10.0;

    @Override
    public PopularPlaceResponseDto getNationwidePopularPlaces(Integer limit, Integer page) {
        int safeLimit = Math.min(limit, 50);
        int offset = (page - 1) * safeLimit;

        List<Integer> placeIds = placeRepository.findNationwidePopularPlaceIds(safeLimit, offset);
        int totalCount = placeRepository.countNationwidePopularPlaces();

        if (placeIds.isEmpty()) {
            return PopularPlaceResponseDto.of(List.of(), page, safeLimit, totalCount);
        }

        Map<Integer, Place> placeMap = placeRepository.findByPlaceIdIn(placeIds)
                .stream()
                .collect(Collectors.toMap(Place::getPlaceId, p -> p));

        List<PopularPlaceItemDto> data = IntStream.range(0, placeIds.size())
                .mapToObj(i -> {
                    Place place = placeMap.get(placeIds.get(i));
                    if (place == null) return null;
                    int ranking = offset + i + 1;
                    return PopularPlaceItemDto.of(place, ranking);
                })
                .filter(Objects::nonNull)
                .toList();

        return PopularPlaceResponseDto.of(data, page, safeLimit, totalCount);
    }

    @Override
    public PopularPlaceResponseDto getPopularPlaces(Double lat, Double lng, Integer limit, Integer page) {
        int safeLimit = Math.min(limit, 50);
        int offset = (page - 1) * safeLimit;

        List<Integer> placeIds = placeRepository.findPopularPlaceIds(lat, lng, SEARCH_RADIUS_KM, safeLimit, offset);
        int totalCount = placeRepository.countPopularPlaces(lat, lng, SEARCH_RADIUS_KM);

        if (placeIds.isEmpty()) {
            return PopularPlaceResponseDto.of(List.of(), page, safeLimit, totalCount);
        }

        Map<Integer, Place> placeMap = placeRepository.findByPlaceIdIn(placeIds)
                .stream()
                .collect(Collectors.toMap(Place::getPlaceId, p -> p));

        List<PopularPlaceItemDto> data = IntStream.range(0, placeIds.size())
                .mapToObj(i -> {
                    Place place = placeMap.get(placeIds.get(i));
                    if (place == null) return null;
                    int ranking = offset + i + 1;
                    return PopularPlaceItemDto.of(place, ranking);
                })
                .filter(Objects::nonNull)
                .toList();

        return PopularPlaceResponseDto.of(data, page, safeLimit, totalCount);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<PopularPlanItemDto> getPlansContainingPlace(Integer placeId) {
        List<Plan> plans = planRepository.findPlansContainingPlace(placeId);

        return plans.stream()
                .map(plan -> {
                    String thumbnail = plan.getPlanPlaces().stream()
                            .filter(pp -> pp.getOrderIndex() != null)
                            .min((a, b) -> a.getOrderIndex().compareTo(b.getOrderIndex()))
                            .map(PlanPlace::getPlace)
                            .map(place -> place != null ? place.getPlaceImageUrl() : null)
                            .orElse(null);

                    String duration = plan.getRequiredTime() != null
                            ? plan.getRequiredTime() + "시간"
                            : null;

                    String locationName = plan.getDeparturePoint() != null ? plan.getDeparturePoint().getName() : null;

                    return PopularPlanItemDto.builder()
                            .id(plan.getPlanId())
                            .title(plan.getPlanTitle())
                            .description(plan.getPlanDescription())
                            .thumbnail(thumbnail)
                            .location(locationName)
                            .duration(duration)
                            .likes(plan.getLikeCount())
                            .build();
                })
                .toList();
    }
}
