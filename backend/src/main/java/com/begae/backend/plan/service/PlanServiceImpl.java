package com.begae.backend.plan.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.like.domain.Like;
import com.begae.backend.like.enums.LikeType;
import com.begae.backend.like.repository.LikeRepository;
import com.begae.backend.place.domain.Place;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.ScrappedPlan;
import com.begae.backend.plan.dto.*;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class PlanServiceImpl implements PlanService{

    private final PlanRepository planRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final PlanPlaceRepository planPlaceRepository;
    private final LikeRepository likeRepository;
    private final ScrappedPlanRepository scrappedPlanRepository;

//    @Value("${tmap.api.key}")
//    private String tmapApiKey;

    @Override
    public void findPlanByLikeCount() {

    }

    @Override
    @Transactional
    public CreatePlanResponseDto CreatePlanWithPlaces(Integer userId, CreatePlanRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Plan plan = Plan.builder()
                .user(user)
                .planTitle(request.getPlanTitle())
                .isVerified(false)
                .isPlanVisible(request.getIsPlanVisible())
                .planDescription(request.getPlanDescription())
                .requiredTime(request.getRequiredTime())
                .totalDistance(request.getTotalDistance())
                .departurePoint(request.getDeparturePoint())
                .tripStartDate(request.getTripStartDate())
                .tripEndDate(request.getTripEndDate())
                .likeCount(0)
                .scrapCount(0)
                .build();
        Plan savedPlan = planRepository.save(plan);

        List<PlanPlace> planPlaces = request.getPlaces().stream()
                .map(placeRequest -> {
                    Place place = placeRepository.findById(placeRequest.getPlaceId())
                            .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

                    return PlanPlace.builder()
                            .plan(savedPlan)
                            .place(place)
                            .orderIndex(placeRequest.getOrder())
                            .travelTime(placeRequest.getTraveltime())
                            .stayTime(placeRequest.getStayTime())

                            // 스냅샷 저장
                            .snapshotPlaceName(place.getPlaceName())
                            .snapshotAddressName(place.getAddressName())
                            .snapshotRoadAddressName(place.getRoadAddressName())
                            .snapshotCategoryName(place.getCategoryName())
                            .snapshotX(place.getX())
                            .snapshotY(place.getY())
                            .build();
                })
                .toList();

        planPlaceRepository.saveAll(planPlaces);

        return CreatePlanResponseDto.builder().planId(savedPlan.getPlanId()).build();

    }

//    @Override
//    public PlanPreviewResponse createPlanPreview(PlanPreviewRequest planPreviewRequest) {
//        List<RouteSegment> routes = calculateAllRoutes(planPreviewRequest);
//
//        List<PlanPreviewResponse.PlaceWithRoute> places = new ArrayList<>();
//
//        for (int i = 0; i < planPreviewRequest.getSelectedPlaces().size(); i++) {
//            PlanPreviewRequest.SelectedPlace place = planPreviewRequest.getSelectedPlaces().get(i);
//
//            // 다음 장소로 가는 경로 (마지막 장소는 null)
//            PlanPreviewResponse.RouteInfo routeInfo = null;
//            if (i < routes.size()) {
//                RouteSegment route = routes.get(i);
//                String toPlaceName = planPreviewRequest.getSelectedPlaces().get(i + 1).getPlaceName();
//
//                routeInfo = PlanPreviewResponse.RouteInfo.builder()
//                        .fromPlaceName(place.getPlaceName())
//                        .toPlaceName(toPlaceName)
//                        .durationMinutes(route.getDurationMinutes())
//                        .distanceKm(route.getDistanceKm())
//                        .transportType(TransportType.valueOf(planPreviewRequest.getTransportType().name()))
//                        .build();
//            }
//
//            places.add(PlanPreviewResponse.PlaceWithRoute.builder()
//                    .sourceId(place.getSourceId())
//                    .placeName(place.getPlaceName())
//                    .addressName(place.getAddressName())
//                    .latitude(place.getLatitude())
//                    .longitude(place.getLongitude())
//                    .orderIndex(i + 1)
//                    .routeToNext(routeInfo)
//                    .build());
//        }
//
//        return PlanPreviewResponse.builder()
//                .planTitle(planPreviewRequest.getPlanTitle())
//                .planDescription(planPreviewRequest.getPlanDescription())
//                .tripDate(planPreviewRequest.getTripDate())
//                .transportType(TransportType.valueOf(planPreviewRequest.getTransportType().name()))
//                .places(places)
//                .build();
//    }
//
    @Transactional(readOnly = true)
    @Override
    public PlanDetailDto getPlanDetail(Integer planId, Integer userId) {
        List<PlanDetailFlatDto> flats = planRepository.findPlanDetailFlat(planId);
        if (flats.isEmpty()) {
            throw new CustomException(PlanErrorCode.PLAN_NOT_FOUND);
        }

        boolean isLiked = false;
        boolean isBookmarked = false;
        if (userId != null) {
            isLiked = likeRepository.findByUser_UserIdAndTypeIdAndLikeType(userId, planId, LikeType.PLAN)
                    .map(Like::getLikeStatus)
                    .orElse(false);
            isBookmarked = scrappedPlanRepository.findByUser_UserIdAndPlan_PlanId(userId, planId)
                    .map(ScrappedPlan::isScrapped)
                    .orElse(false);
        }

        return PlanDetailDto.from(flats, isLiked, isBookmarked);
    }

    private static final double SEARCH_RADIUS_KM = 10.0;

    @Transactional(readOnly = true)
    @Override
    public PopularPlanResponseDto getPopularPlans(Double lat, Double lng, Integer limit, Integer page) {
        int safeLimit = Math.min(limit, 50);
        int offset = (page - 1) * safeLimit;

        List<Integer> planIds = planRepository.findPopularPlanIds(lat, lng, SEARCH_RADIUS_KM, safeLimit, offset);
        int totalCount = planRepository.countPopularPlans(lat, lng, SEARCH_RADIUS_KM);

        if (planIds.isEmpty()) {
            return PopularPlanResponseDto.of(List.of(), page, safeLimit, totalCount);
        }

        Map<Integer, Plan> planMap = planRepository.findByPlanIdIn(planIds)
                .stream()
                .collect(Collectors.toMap(Plan::getPlanId, p -> p));

        List<PopularPlanItemDto> data = IntStream.range(0, planIds.size())
                .mapToObj(i -> {
                    Plan plan = planMap.get(planIds.get(i));
                    if (plan == null) return null;
                    int ranking = offset + i + 1;
                    return PopularPlanItemDto.of(plan, ranking);
                })
                .filter(Objects::nonNull)
                .toList();

        return PopularPlanResponseDto.of(data, page, safeLimit, totalCount);
    }

    @Transactional(readOnly = true)
    @Override
    public PopularPlanResponseDto getNationwidePopularPlans(Integer limit, Integer page) {
        int safeLimit = Math.min(limit, 50);
        int offset = (page - 1) * safeLimit;

        List<Integer> planIds = planRepository.findNationwidePopularPlanIds(safeLimit, offset);
        int totalCount = planRepository.countNationwidePopularPlans();

        if (planIds.isEmpty()) {
            return PopularPlanResponseDto.of(List.of(), page, safeLimit, totalCount);
        }

        Map<Integer, Plan> planMap = planRepository.findByPlanIdIn(planIds)
                .stream()
                .collect(Collectors.toMap(Plan::getPlanId, p -> p));

        List<PopularPlanItemDto> data = IntStream.range(0, planIds.size())
                .mapToObj(i -> {
                    Plan plan = planMap.get(planIds.get(i));
                    if (plan == null) return null;
                    int ranking = offset + i + 1;
                    return PopularPlanItemDto.of(plan, ranking);
                })
                .filter(Objects::nonNull)
                .toList();

        return PopularPlanResponseDto.of(data, page, safeLimit, totalCount);
    }

    @Transactional
    @Override
    public PlanCopyResponseDto copyPlan(
            Integer planId,
            PlanCopyRequestDto planCopyRequestDto,
            Integer userId) {
        Plan originPlan = planRepository.findByIdWithLock(planId)
                .orElseThrow(() -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND));
        originPlan.validateNotBlinded();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        for(Plan plan : user.getPlans()) {
            if(originPlan.getPlanId().equals(plan.getPlanId())) {
                throw new CustomException(PlanErrorCode.NOT_COPY_MINE);
            }
        }

        Plan newPlan = Plan.copyOf(originPlan, user);
        planRepository.save(newPlan);

        return PlanCopyResponseDto.of(newPlan, originPlan.getPlanId());
    }

    @Override
    @Transactional
    public Integer updatePlan(Integer userId, Integer planId, UpdatePlanRequestDto request) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND));

        validatePlanOwner(plan, userId);

        if(request.hasVerificationRestrictedFields() && plan.isVerifiedPlan()) {
            throw new CustomException(PlanErrorCode.VERIFIED_PLAN_UPDATE_RESTRICTED);
        }

        if (request.getTripStartDate() != null
                && request.getTripEndDate() != null
                && request.getTripStartDate().isAfter(request.getTripEndDate())) {
            throw new CustomException(PlanErrorCode.INVALID_TRIP_DATE_RANGE);
        }

        plan.updateBasicInfo(
                request.getPlanTitle(),
                request.getIsPlanVisible(),
                request.getPlanDescription()
        );

        plan.updateUnverifiedOnlyInfo(
                request.getTripStartDate(),
                request.getTripEndDate()
        );

        return plan.getPlanId();
    }

    @Override
    @Transactional
    public void deletePlan(Integer userId, Integer planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND));

        validatePlanOwner(plan, userId);

        planRepository.delete(plan);

    }

    private void validatePlanOwner(Plan plan, Integer userId) {
        if (!plan.getUser().getUserId().equals(userId)) {
            throw new CustomException(PlanErrorCode.PLAN_ACCESS_DENIED);
        }
    }
//
//    private List<RouteSegment> calculateAllRoutes(PlanPreviewRequest request) {
//        List<RouteSegment> routes = new ArrayList<>();
//        List<PlanPreviewRequest.SelectedPlace> places = request.getSelectedPlaces();
//
//        for (int i = 0; i < places.size() - 1; i++) {
//            PlanPreviewRequest.SelectedPlace from = places.get(i);
//            PlanPreviewRequest.SelectedPlace to = places.get(i + 1);
//
//            try {
//                RouteSegment route = calculateRoute(
//                        Double.parseDouble(from.getLatitude()),
//                        Double.parseDouble(from.getLongitude()),
//                        Double.parseDouble(to.getLatitude()),
//                        Double.parseDouble(to.getLongitude()),
//                        request.getTransportType()
//                );
//
//                routes.add(route);
//
//            } catch (Exception e) {
//                e.printStackTrace();
//            }
//        }
//
//        return routes;
//    }
//
//    /**
//     * TMAP 자동차 경로
//     */
//    private RouteSegment getCarRoute(double fromLat, double fromLon, double toLat, double toLon) {
//        String url = "https://apis.openapi.sk.com/tmap/routes";
//
//        Map<String, Object> requestBody = new HashMap<>();
//        requestBody.put("startX", String.valueOf(fromLon));
//        requestBody.put("startY", String.valueOf(fromLat));
//        requestBody.put("endX", String.valueOf(toLon));
//        requestBody.put("endY", String.valueOf(toLat));
//        requestBody.put("reqCoordType", "WGS84GEO");
//        requestBody.put("resCoordType", "WGS84GEO");
//        requestBody.put("searchOption", "0");
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("appKey", tmapApiKey);
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
//        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
//
//        Map<String, Object> body = response.getBody();
//        if (body != null && body.containsKey("features")) {
//            List<Map<String, Object>> features = (List<Map<String, Object>>) body.get("features");
//            if (!features.isEmpty()) {
//                Map<String, Object> properties = (Map<String, Object>) features.get(0).get("properties");
//
//                Integer totalTime = (Integer) properties.get("totalTime");
//                Integer totalDistance = (Integer) properties.get("totalDistance");
//
//                return new RouteSegment(totalTime / 60, totalDistance / 1000.0);
//            }
//        }
//
//        throw new RuntimeException("자동차 경로를 찾을 수 없습니다.");
//    }
//
//    private RouteSegment getWalkRoute(double fromLat, double fromLon, double toLat, double toLon) {
//        String url = "https://apis.openapi.sk.com/tmap/routes/pedestrian";
//
//        Map<String, Object> requestBody = new HashMap<>();
//        requestBody.put("startX", String.valueOf(fromLon));
//        requestBody.put("startY", String.valueOf(fromLat));
//        requestBody.put("endX", String.valueOf(toLon));
//        requestBody.put("endY", String.valueOf(toLat));
//        requestBody.put("reqCoordType", "WGS84GEO");
//        requestBody.put("resCoordType", "WGS84GEO");
//        requestBody.put("startName", "출발지");
//        requestBody.put("endName", "도착지");
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("appKey", tmapApiKey);
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
//        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
//
//        Map<String, Object> body = response.getBody();
//        if (body != null && body.containsKey("features")) {
//            List<Map<String, Object>> features = (List<Map<String, Object>>) body.get("features");
//            if (!features.isEmpty()) {
//                Map<String, Object> properties = (Map<String, Object>) features.get(0).get("properties");
//
//                Integer totalTime = (Integer) properties.get("totalTime");
//                Integer totalDistance = (Integer) properties.get("totalDistance");
//
//                return new RouteSegment(totalTime / 60, totalDistance / 1000.0);
//            }
//        }
//
//        throw new RuntimeException("보행자 경로를 찾을 수 없습니다.");
//    }
//
//
//    private RouteSegment calculateRoute(
//            double fromLat, double fromLon,
//            double toLat, double toLon,
//            TransportType type) {
//
//        return switch (type) {
//            case CAR -> getCarRoute(fromLat, fromLon, toLat, toLon);
//            case WALK -> getWalkRoute(fromLat, fromLon, toLat, toLon);
////            case PUBLIC_TRANSIT:
////                return estimateRoute(fromLat, fromLon, toLat, toLon, type);
//            default -> throw new IllegalArgumentException("Unknown transport type: " + type);
//        };
//    }
//
//    private static class RouteSegment {
//        private Integer durationMinutes;
//        private Double distanceKm;
//
//        public RouteSegment(Integer durationMinutes, Double distanceKm) {
//            this.durationMinutes = durationMinutes;
//            this.distanceKm = distanceKm;
//        }
//
//        public Integer getDurationMinutes() { return durationMinutes; }
//        public Double getDistanceKm() { return distanceKm; }
//    }
}
