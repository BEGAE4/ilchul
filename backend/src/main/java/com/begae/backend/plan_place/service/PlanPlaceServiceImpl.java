package com.begae.backend.plan_place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.domain.Place;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.dto.*;
import com.begae.backend.plan_place.exception.PlanPlaceErrorCode;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PlanPlaceServiceImpl implements PlanPlaceService {

    private final PlanPlaceRepository planPlaceRepository;
    private final PlanRepository planRepository;
    private final PlaceRepository placeRepository;

    private final WebClient kakaoNaviWebClient;
    private final WebClient kakaoWebClient;

    @Override
    @Transactional(readOnly = true)
    public CreatePlanPreviewResponseDto createPlanPreview(CreatePlanPreviewRequestDto request) {

        List<CreatePlanPreviewRequestDto.Place> placesByRequest = getPlaces(request);

        List<CreatePlanPreviewRequestDto.Place> ordered = placesByRequest.stream()
                .sorted(Comparator.comparingInt(CreatePlanPreviewRequestDto.Place::getOrder))
                .toList();

        List<Integer> ids = ordered.stream()
                .map(CreatePlanPreviewRequestDto.Place::getPlaceId)
                .toList();

        List<Place> places = placeRepository.findAllById(ids);

        Map<Integer, Place> placeById = places.stream()
                .collect(Collectors.toMap(Place::getPlaceId, Function.identity()));

        List<Point> points = ordered.stream()
                .map(p -> {
                    Place place = placeById.get(p.getPlaceId());
                    return new Point(place.getPlaceName(), place.getX(), place.getY());
                })
                .toList();

        KaKaoGeocodingResponseDto departurePoint = kakaoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/address")
                        .queryParam("query", request.getDeparturePoint())
                        .build())
                .retrieve()
                .bodyToMono(KaKaoGeocodingResponseDto.class)
                .timeout(Duration.ofSeconds(10))
                .block();
        KaKaoGeocodingResponseDto.Document document = departurePoint.getDocuments().getFirst();

        Point origin = new Point(document.getAddressName(), Double.parseDouble(document.getX()), Double.parseDouble(document.getY()));
        Point destination = points.getLast();
        List<Point> waypoints = (points.size() > 1) ? points.subList(0, points.size() - 1) : List.of();

        KakaoNaviRequestDto naviRequest = KakaoNaviRequestDto.builder()
                .origin(origin)
                .destination(destination)
                .waypoints(waypoints)
                .priority("RECOMMEND")
                .summary(true)
                .build();

        KakaoNaviResponseDto response = kakaoNaviWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/waypoints/directions")
                        .build())
                .bodyValue(naviRequest)
                .retrieve()
                .bodyToMono(KakaoNaviResponseDto.class)
                .timeout(Duration.ofSeconds(10))
                .block();

        KakaoNaviResponseDto.Route route = response.getRoutes().getFirst();
        int totalDuration = (int) Math.round(route.getSummary().getDuration() / 60.0);
        List<Integer> sectionDuration = route.getSections().stream()
                .map(section -> (int) Math.round(section.getDuration() / 60.0))
                .toList();


        int totalDistance = (int) Math.round(route.getSummary().getDistance() / 1000.0);

        List<CreatePlanPreviewResponseDto.PlanPlacePreview> routes = new ArrayList<>();
        for(int i = 0; i < places.size(); i++) {
            Place place = places.get(i);
            routes.add(CreatePlanPreviewResponseDto.PlanPlacePreview.builder()
                    .placeId(place.getPlaceId())
                    .placeName(place.getPlaceName())
                    .categoryName(place.getCategoryName())
                    .addressName(place.getAddressName())
                    .roadAddressName(place.getRoadAddressName())
                    .order(i + 1)
                    .duration(i >= sectionDuration.size() ? 0 : sectionDuration.get(i))
                    .x(place.getX())
                    .y(place.getY())
                    .build());
        }

        return CreatePlanPreviewResponseDto.builder()
                .planTitle(request.getPlanTitle())
                .planDescription(request.getPlanDescription())
                .isPlanVisible(request.getIsPlanVisible())
                .requiredTime(totalDuration)
                .totalDistance(totalDistance)
                .departurePoint(request.getDeparturePoint())
                .tripStartDate(request.getTripStartDate())
                .tripEndDate(request.getTripEndDate())
                .places(routes)
                .build();
    }


    @Transactional(readOnly = true)
    @Override
    public UpdatePlanPreviewResponseDto updatePlanPreview(Integer userId, Integer planId, UpdatePlanPlaceRequestDto request) {
        Plan plan = planRepository.findByPlanIdAndUserId(planId, userId).orElseThrow(
                () -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND)
        );

        if(plan.isVerifiedPlan()) {
            throw new CustomException(PlanErrorCode.VERIFIED_PLAN_UPDATE_RESTRICTED);
        }
        
        List<PlanPlace> existPlanPlaces = plan.getPlanPlaces();
        
        Map<Integer, PlanPlace> existingMap = existPlanPlaces.stream().collect(
                Collectors.toMap(
                        planPlace -> planPlace.getPlanPlaceId(),
                        planPlace -> planPlace
                )
        );

        List<UpdatePlanPlaceItemDto> places = getPlaces(request.getPlaces(), existingMap);

        places.sort(Comparator.comparingInt(UpdatePlanPlaceItemDto::getOrder));

        List<Integer> placeIds = places.stream()
                .map(UpdatePlanPlaceItemDto::getPlaceId).toList();

        List<Place> placesInDb = placeRepository.findAllById(placeIds);

        Map<Integer, Place> placeById = placesInDb.stream()
                .collect(Collectors.toMap(Place::getPlaceId, Function.identity()));

        List<Point> points = places.stream()
                .map(p -> {
                            if(existingMap.get(p.getPlanPlaceId()) != null) {
                                PlanPlace planPlace = existingMap.get(p.getPlanPlaceId());
                                return new Point(planPlace.getSnapshotPlaceName(), planPlace.getSnapshotX(), planPlace.getSnapshotY());
                            }
                            Place place = placeById.get(p.getPlaceId());
                            return new Point(place.getPlaceName(), place.getX(), place.getY());
                        }
                ).toList();

        KaKaoGeocodingResponseDto departurePoint = kakaoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/address")
                        .queryParam("query", request.getDeparturePoint())
                        .build())
                .retrieve()
                .bodyToMono(KaKaoGeocodingResponseDto.class)
                .timeout(Duration.ofSeconds(10))
                .block();
        KaKaoGeocodingResponseDto.Document document = departurePoint.getDocuments().getFirst();

        Point origin = new Point(document.getAddressName(), Double.parseDouble(document.getX()), Double.parseDouble(document.getY()));
        Point destination = points.getLast();
        List<Point> waypoints = (points.size() > 1) ? points.subList(0, points.size() - 1) : List.of();

        KakaoNaviRequestDto naviRequest = KakaoNaviRequestDto.builder()
                .origin(origin)
                .destination(destination)
                .waypoints(waypoints)
                .priority("RECOMMEND")
                .summary(true)
                .build();

        KakaoNaviResponseDto response = kakaoNaviWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/waypoints/directions")
                        .build())
                .bodyValue(naviRequest)
                .retrieve()
                .bodyToMono(KakaoNaviResponseDto.class)
                .timeout(Duration.ofSeconds(10))
                .block();

        KakaoNaviResponseDto.Route route = response.getRoutes().getFirst();
        int totalDuration = (int) Math.round(route.getSummary().getDuration() / 60.0);
        List<Integer> sectionDuration = route.getSections().stream()
                .map(section -> (int) Math.round(section.getDuration() / 60.0))
                .toList();


        int totalDistance = (int) Math.round(route.getSummary().getDistance() / 1000.0);

        List<UpdatePlanPreviewResponseDto.PlanPlacePreview> routes = new ArrayList<>();
        for(int i = 0; i < places.size(); i++) {
            UpdatePlanPlaceItemDto requestPlace = places.get(i);
            if(existingMap.get(requestPlace.getPlanPlaceId()) != null) {
                PlanPlace planPlace = existingMap.get(requestPlace.getPlanPlaceId());
                routes.add(UpdatePlanPreviewResponseDto.PlanPlacePreview.builder()
                        .placeId(planPlace.getPlace().getPlaceId())
                        .placeName(planPlace.getSnapshotPlaceName())
                        .categoryName(planPlace.getSnapshotCategoryName())
                        .addressName(planPlace.getSnapshotAddressName())
                        .roadAddressName(planPlace.getSnapshotRoadAddressName())
                        .order(i + 1)
                        .duration(i >= sectionDuration.size() ? 0 : sectionDuration.get(i))
                        .x(planPlace.getSnapshotX())
                        .y(planPlace.getSnapshotY())
                        .stayTime(planPlace.getStayTime())
                        .isStamped(planPlace.getIsStamped())
                        .build());
            } else {
                Place place = placesInDb.get(i);
                routes.add(UpdatePlanPreviewResponseDto.PlanPlacePreview.builder()
                        .placeId(place.getPlaceId())
                        .placeName(place.getPlaceName())
                        .categoryName(place.getCategoryName())
                        .addressName(place.getAddressName())
                        .roadAddressName(place.getRoadAddressName())
                        .order(i + 1)
                        .duration(i >= sectionDuration.size() ? 0 : sectionDuration.get(i))
                        .x(place.getX())
                        .y(place.getY())
                        .stayTime(null)
                        .isStamped(Boolean.FALSE)
                        .build());
            }

        }

        return UpdatePlanPreviewResponseDto.builder()
                .planTitle(plan.getPlanTitle())
                .planDescription(plan.getPlanDescription())
                .isPlanVisible(plan.getIsPlanVisible())
                .requiredTime(totalDuration)
                .totalDistance(totalDistance)
                .departurePoint(plan.getDeparturePoint())
                .tripStartDate(plan.getTripStartDate())
                .tripEndDate(plan.getTripEndDate())
                .places(routes)
                .build();
    }

    @Transactional
    @Override
    public UpdatePlanPlaceResponseDto updatePlanPlace(Integer userId, Integer planId, UpdatePlanPlaceRequestDto request) {

        Plan plan = planRepository.findByPlanIdAndUserId(planId, userId).orElseThrow(
                () -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND)
        );

        if(plan.isVerifiedPlan()) {
            throw new CustomException(PlanErrorCode.VERIFIED_PLAN_UPDATE_RESTRICTED);
        }

        List<PlanPlace> existPlanPlaces = plan.getPlanPlaces();

        Map<Integer, PlanPlace> existingMap = existPlanPlaces.stream().collect(
                Collectors.toMap(
                        planPlace -> planPlace.getPlanPlaceId(),
                        planPlace -> planPlace
                )
        );

        List<UpdatePlanPlaceItemDto> places = getPlaces(request.getPlaces(), existingMap);

        places.sort(Comparator.comparingInt(UpdatePlanPlaceItemDto::getOrder));

        List<Integer> placeIds = places.stream()
                .map(UpdatePlanPlaceItemDto::getPlaceId).toList();

        List<Place> placesInDb = placeRepository.findAllById(placeIds);

        Map<Integer, Place> placeById = placesInDb.stream()
                .collect(Collectors.toMap(Place::getPlaceId, Function.identity()));

        List<Point> points = places.stream()
                .map(p -> {
                            if(existingMap.get(p.getPlanPlaceId()) != null) {
                                PlanPlace planPlace = existingMap.get(p.getPlanPlaceId());
                                return new Point(planPlace.getSnapshotPlaceName(), planPlace.getSnapshotX(), planPlace.getSnapshotY());
                            }
                            Place place = placeById.get(p.getPlaceId());
                            return new Point(place.getPlaceName(), place.getX(), place.getY());
                        }
                ).toList();

        KaKaoGeocodingResponseDto departurePoint = kakaoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/address")
                        .queryParam("query", request.getDeparturePoint())
                        .build())
                .retrieve()
                .bodyToMono(KaKaoGeocodingResponseDto.class)
                .timeout(Duration.ofSeconds(10))
                .block();
        KaKaoGeocodingResponseDto.Document document = departurePoint.getDocuments().getFirst();

        Point origin = new Point(document.getAddressName(), Double.parseDouble(document.getX()), Double.parseDouble(document.getY()));
        Point destination = points.getLast();
        List<Point> waypoints = (points.size() > 1) ? points.subList(0, points.size() - 1) : List.of();

        KakaoNaviRequestDto naviRequest = KakaoNaviRequestDto.builder()
                .origin(origin)
                .destination(destination)
                .waypoints(waypoints)
                .priority("RECOMMEND")
                .summary(true)
                .build();

        KakaoNaviResponseDto response = kakaoNaviWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/waypoints/directions")
                        .build())
                .bodyValue(naviRequest)
                .retrieve()
                .bodyToMono(KakaoNaviResponseDto.class)
                .timeout(Duration.ofSeconds(10))
                .block();

        KakaoNaviResponseDto.Route route = response.getRoutes().getFirst();
        int totalDuration = (int) Math.round(route.getSummary().getDuration() / 60.0);
        List<Integer> sectionDuration = route.getSections().stream()
                .map(section -> (int) Math.round(section.getDuration() / 60.0))
                .toList();


        int totalDistance = (int) Math.round(route.getSummary().getDistance() / 1000.0);

        List<PlanPlace> routes = new ArrayList<>();
        for(int i = 0; i < places.size(); i++) {
            UpdatePlanPlaceItemDto requestPlace = places.get(i);
            PlanPlace planPlace = existingMap.get(requestPlace.getPlanPlaceId());
            if(planPlace != null && requestPlace.getPlaceId().equals(planPlace.getPlace().getPlaceId())) {
                routes.add(PlanPlace.builder()
                        .place(planPlace.getPlace())
                        .plan(plan)
                        .orderIndex(i + 1)
                        .travelTime(i >= sectionDuration.size() ? 0 : sectionDuration.get(i))
                        .stayTime(planPlace.getStayTime())
                        .isStamped(planPlace.getIsStamped())
                        .snapshotPlaceName(planPlace.getSnapshotPlaceName())
                        .snapshotCategoryName(planPlace.getSnapshotCategoryName())
                        .snapshotAddressName(planPlace.getSnapshotAddressName())
                        .snapshotRoadAddressName(planPlace.getSnapshotRoadAddressName())
                        .snapshotX(planPlace.getSnapshotX())
                        .snapshotY(planPlace.getSnapshotY())
                        .planPlaceImages(planPlace.getPlanPlaceImages())
                        .build());
            } else {
                Place place = placesInDb.get(i);
                routes.add(PlanPlace.builder()
                        .place(place)
                        .plan(plan)
                        .orderIndex(i + 1)
                        .travelTime(i >= sectionDuration.size() ? 0 : sectionDuration.get(i))
                        .stayTime(null)
                        .isStamped(Boolean.FALSE)
                        .snapshotPlaceName(place.getPlaceName())
                        .snapshotCategoryName(place.getCategoryName())
                        .snapshotAddressName(place.getAddressName())
                        .snapshotRoadAddressName(place.getRoadAddressName())
                        .snapshotX(place.getX())
                        .snapshotY(place.getY())
                        .planPlaceImages(List.of())
                        .build());
            }

        }

        planPlaceRepository.deleteAllByPlanId(plan.getPlanId());

        planPlaceRepository.saveAll(routes);

        plan.updateRouteSummary(totalDuration, totalDistance, request.getDeparturePoint());

        return UpdatePlanPlaceResponseDto.builder().planId(plan.getPlanId()).build();
    }



    @NotNull
    private static List<CreatePlanPreviewRequestDto.Place> getPlaces(CreatePlanPreviewRequestDto request) {
        List<CreatePlanPreviewRequestDto.Place> places = request.getPlaces();


        if(places == null || places.isEmpty()) {
            throw new CustomException(PlanPlaceErrorCode.EMPTY_PLAN_PLACE);
        }

        Set<Integer> orders = new HashSet<>();

        places.forEach(place -> {
            if (place.getPlaceId() == null) {
                throw new CustomException(PlanPlaceErrorCode.INVALID_PLAN_PLACE);
            }
            if (place.getOrder() == null || place.getOrder() <= 0 || !orders.add(place.getOrder())) {
                throw new CustomException(PlanPlaceErrorCode.INVALID_ORDER_STATE);
            }
        });
        return places;
    }

    @NotNull
    private static List<UpdatePlanPlaceItemDto> getPlaces(List<UpdatePlanPlaceItemDto> places, Map<Integer, PlanPlace> existingMap) {

        if(places == null || places.isEmpty()) {
            throw new CustomException(PlanPlaceErrorCode.EMPTY_PLAN_PLACE);
        }

        Set<Integer> orders = new HashSet<>();
        Set<Integer> planPlaceIds = new HashSet<>();

        places.forEach(place -> {
           if(place.getPlaceId() == null) {
               throw new CustomException(PlanPlaceErrorCode.INVALID_PLAN_PLACE);
           }
           if(place.getOrder() == null || place.getOrder() <= 0 || !orders.add(place.getOrder())) {
               throw new CustomException(PlanPlaceErrorCode.INVALID_ORDER_STATE);
           }
           if(place.getPlanPlaceId() != null && (existingMap.get(place.getPlanPlaceId()) == null || !planPlaceIds.add(place.getPlanPlaceId()))) {
               throw new CustomException(PlanPlaceErrorCode.INVALID_PLAN_PLACE);
           }
        });
        return places;
    }



}
