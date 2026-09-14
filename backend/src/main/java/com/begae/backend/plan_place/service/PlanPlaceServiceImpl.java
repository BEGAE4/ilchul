package com.begae.backend.plan_place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.domain.Place;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.DeparturePoint;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.dto.DeparturePointDto;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.domain.PlanPlaceImage;
import com.begae.backend.plan_place.dto.*;
import com.begae.backend.plan_place.exception.PlanPlaceErrorCode;
import com.begae.backend.plan_place.repository.PlanPlaceImageRepository;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import com.begae.backend.plan_place.util.LocationUtils;
import com.begae.backend.storage.dto.StoredImage;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDateTime;
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
    private final PlanPlaceImageRepository planPlaceImageRepository;

    private final PlanService planService;
    private final ImageStorageService imageStorageService;
    private final ImageFileCleaner imageFileCleaner;

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

        getDurationDto duration = getDuration(request.getDeparturePoint(), points);

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
                    .duration(i >= duration.getSectionDuration().size() ? 0 : duration.getSectionDuration().get(i))
                    .x(place.getX())
                    .y(place.getY())
                    .build());
        }

        return CreatePlanPreviewResponseDto.builder()
                .planTitle(request.getPlanTitle())
                .planDescription(request.getPlanDescription())
                .isPlanVisible(request.getIsPlanVisible())
                .requiredTime(duration.getTotalDuration())
                .totalDistance(duration.getTotalDistance())
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

        planService.validatePlanOwner(plan, userId);

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

        getDurationDto duration = getDuration(request.getDeparturePoint(), points);

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
                        .duration(i >= duration.getSectionDuration().size() ? 0 : duration.getSectionDuration().get(i))
                        .x(planPlace.getSnapshotX())
                        .y(planPlace.getSnapshotY())
                        .stayTime(planPlace.getStayTime())
                        .isStamped(planPlace.getIsStamped())
                        .build());
            } else {
                Place place = placeById.get(requestPlace.getPlaceId());
                routes.add(UpdatePlanPreviewResponseDto.PlanPlacePreview.builder()
                        .placeId(place.getPlaceId())
                        .placeName(place.getPlaceName())
                        .categoryName(place.getCategoryName())
                        .addressName(place.getAddressName())
                        .roadAddressName(place.getRoadAddressName())
                        .order(i + 1)
                        .duration(i >= duration.getSectionDuration().size() ? 0 : duration.getSectionDuration().get(i))
                        .x(place.getX())
                        .y(place.getY())
                        .stayTime(null)
                        .isStamped(Boolean.FALSE)
                        .build());
            }

        }

        return UpdatePlanPreviewResponseDto.builder()
                .planId(plan.getPlanId())
                .planTitle(plan.getPlanTitle())
                .planDescription(plan.getPlanDescription())
                .isPlanVisible(plan.getIsPlanVisible())
                .requiredTime(duration.getTotalDuration())
                .totalDistance(duration.getTotalDistance())
                .departurePoint(request.getDeparturePoint())
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

        planService.validatePlanOwner(plan, userId);

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

        getDurationDto duration = getDuration(request.getDeparturePoint(), points);

        // 유지하는 장소는 그 자리에서 순서만 바꿔 planPlaceId 와 스탬프 사진을 보존한다.
        Set<Integer> keptPlanPlaceIds = new HashSet<>();
        List<PlanPlace> addedPlanPlaces = new ArrayList<>();
        for(int i = 0; i < places.size(); i++) {
            UpdatePlanPlaceItemDto requestPlace = places.get(i);
            int travelTime = i >= duration.getSectionDuration().size() ? 0 : duration.getSectionDuration().get(i);
            PlanPlace planPlace = existingMap.get(requestPlace.getPlanPlaceId());
            if(planPlace != null && requestPlace.getPlaceId().equals(planPlace.getPlace().getPlaceId())) {
                planPlace.moveTo(i + 1, travelTime);
                keptPlanPlaceIds.add(planPlace.getPlanPlaceId());
            } else {
                Place place = placeById.get(requestPlace.getPlaceId());
                addedPlanPlaces.add(PlanPlace.builder()
                        .place(place)
                        .plan(plan)
                        .orderIndex(i + 1)
                        .travelTime(travelTime)
                        .stayTime(null)
                        .isStamped(Boolean.FALSE)
                        .snapshotPlaceName(place.getPlaceName())
                        .snapshotCategoryName(place.getCategoryName())
                        .snapshotAddressName(place.getAddressName())
                        .snapshotRoadAddressName(place.getRoadAddressName())
                        .snapshotX(place.getX())
                        .snapshotY(place.getY())
                        .build());
            }
        }

        List<String> removedImageKeys = existPlanPlaces.stream()
                .filter(planPlace -> !keptPlanPlaceIds.contains(planPlace.getPlanPlaceId()))
                .flatMap(planPlace -> planPlace.getPlanPlaceImages().stream())
                .map(PlanPlaceImage::getImageKey)
                .filter(imageKey -> !planPlaceImageRepository.existsByImageKeyAndPlanPlace_PlanNot(imageKey, plan))
                .toList();

        existPlanPlaces.removeIf(planPlace -> !keptPlanPlaceIds.contains(planPlace.getPlanPlaceId()));
        existPlanPlaces.addAll(addedPlanPlaces);
        imageFileCleaner.deleteAfterCommit(removedImageKeys);

        plan.updateRouteSummary(duration.getTotalDuration(), duration.getTotalDistance(), DeparturePoint.of(request.getDeparturePoint()));

        return UpdatePlanPlaceResponseDto.builder().planId(plan.getPlanId()).build();
    }

    private getDurationDto getDuration(DeparturePointDto departurePoint, List<Point> points) {
        //        KaKaoGeocodingResponseDto departurePoint = kakaoWebClient.get()
//                .uri(uriBuilder -> uriBuilder
//                        .path("/v2/local/search/address")
//                        .queryParam("query", request.getDeparturePoint())
//                        .build())
//                .retrieve()
//                .bodyToMono(KaKaoGeocodingResponseDto.class)
//                .timeout(Duration.ofSeconds(10))
//                .block();
//        KaKaoGeocodingResponseDto.Document document = departurePoint.getDocuments().getFirst();
//
//        Point origin = new Point(document.getAddressName(), Double.parseDouble(document.getX()), Double.parseDouble(document.getY()));
        Point origin = new Point(departurePoint.getName(), departurePoint.getX(), departurePoint.getY());
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
        if(route.getResultCode() != 0) {
            // 경로를 못 찾아도 플랜 작성은 막지 않는다. 호출부는 구간 소요시간이 없으면 0으로 채운다.
            log.warn("경로 탐색 실패 : {} code : {}", route.getResultMsg(), route.getResultCode());
            return getDurationDto.builder()
                    .totalDistance(0)
                    .totalDuration(0)
                    .sectionDuration(List.of())
                    .build();
        }
        int totalDuration = (int) Math.round(route.getSummary().getDuration() / 60.0);
        List<Integer> sectionDuration = route.getSections().stream()
                .map(section -> (int) Math.round(section.getDuration() / 60.0))
                .toList();


        int totalDistance = (int) Math.round(route.getSummary().getDistance() / 1000.0);

        return getDurationDto.builder()
                        .totalDistance(totalDistance)
                        .totalDuration(totalDuration)
                        .sectionDuration(sectionDuration)
                        .build();
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

    @Transactional
    @Override
    public StampPlanPlaceResponseDto stampPlanPlace(Integer userId, Integer planPlaceId, StampPlanPlaceRequestDto request) {
        PlanPlace planPlace = planPlaceRepository.findByPlanPlaceIdAndPlan_User_UserId(planPlaceId, userId).orElseThrow(
                () -> new CustomException(PlanPlaceErrorCode.PLAN_PLACE_NOT_FOUND)
        );

        if(planPlace.getIsStamped()) {
            throw new CustomException(PlanPlaceErrorCode.ALREADY_VERIFIED);
        }

        // request에서 x y 꺼내 planPlace의 x y 기준 범위 안에 있는지 체크
        // 저장소 파일 작업은 롤백되지 않으므로 검증을 먼저 끝낸다.
        double distance = LocationUtils.calculateDistance(
                request.getLocation().getY(),
                request.getLocation().getX(),
                planPlace.getSnapshotY(),
                planPlace.getSnapshotX()
        );

        if(distance > 150) {
            throw new CustomException(PlanPlaceErrorCode.OUT_OF_STAMP_RANGE);
        }

        List<String> replacedImageKeys = planPlace.getPlanPlaceImages().stream()
                .map(PlanPlaceImage::getImageKey)
                .filter(imageKey -> !planPlaceImageRepository.existsByImageKeyAndPlanPlaceNot(imageKey, planPlace))
                .toList();
        planPlace.getPlanPlaceImages().clear();

        StoredImage storedImage = imageStorageService.upload(request.getImage(),
                "planPlace/" + planPlace.getPlanPlaceId() + "/image");
        imageFileCleaner.deleteIfRolledBack(storedImage.imageKey());

        PlanPlaceImage planPlaceImage = PlanPlaceImage.builder()
                                .imageKey(storedImage.imageKey())
                                .imageUrl(storedImage.imageUrl())
                                .originalFilename(storedImage.originalFilename())
                                .contentType(storedImage.contentType())
                                .fileSize(storedImage.fileSize())
                                .planPlace(planPlace)
                                .build();

        planPlaceImageRepository.save(planPlaceImage);
        imageFileCleaner.deleteAfterCommit(replacedImageKeys);

        planPlace.stamp();

        return StampPlanPlaceResponseDto.builder()
                        .planPlaceId(planPlace.getPlanPlaceId())
                        .isStamped(planPlace.getIsStamped())
                        .verifiedImage(planPlaceImage.getImageUrl())
                        .stampedAt(LocalDateTime.now())
                        .build();
    }


}
