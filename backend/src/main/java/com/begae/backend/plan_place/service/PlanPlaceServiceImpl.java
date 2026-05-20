package com.begae.backend.plan_place.service;

import com.begae.backend.place.domain.Place;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.dto.*;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
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

    @Override
    public CreatePlanPreviewResponseDto createPlanPreview(CreatePlanPreviewRequestDto request) {

        List<CreatePlanPreviewRequestDto.Place> ordered = request.getPlaces()
                .stream()
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

        Point origin = points.getFirst();
        Point destination = points.getLast();
        List<Point> waypoints = (points.size() > 2) ? points.subList(1, points.size() - 1) : List.of();

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
                    .duration(i == 0 ? 0 : sectionDuration.get(i - 1))
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


    public UpdatePlanPlaceResponseDto updatePlanPlace(Integer userId, Integer planId, UpdatePlanPlaceRequestDto request) {
        Plan plan = planRepository.findByPlanIdAndUserId(planId, userId).orElseThrow();

        plan.updateRouteSummary(request.getRequiredTime(), request.getTotalDistance(), request.getDeparturePoint());

        List<PlanPlace> oldPlanPlaces = planPlaceRepository.findByPlanOrderByOrderIndexAsc(plan);


        return UpdatePlanPlaceResponseDto.builder().build();
    }

}
