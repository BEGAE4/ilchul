package com.begae.backend.plan.service;

import com.begae.backend.plan.dto.PlanDetailDto;
import com.begae.backend.plan.dto.PlanDetailFlatDto;
import com.begae.backend.plan.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlanServiceImpl implements PlanService{

    private final PlanRepository planRepository;
    private final RestTemplate restTemplate = new RestTemplate();

//    @Value("${tmap.api.key}")
//    private String tmapApiKey;

    @Override
    public void findPlanByLikeCount() {

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
//    @Override
//    public PlanDetailDto getPlanDetail(Integer planId) {
//        List<PlanDetailFlatDto> flats = planRepository.findPlanDetailFlat(planId);
//        if (flats.isEmpty()) {
//            throw new IllegalArgumentException("plan이 없습니다.");
//        }
//        PlanDetailFlatDto first = flats.getFirst();
//        List<PlanDetailDto.PlanPlaceDetailDto> places =
//                flats.stream()
//                        .filter(f -> f.getPlanPlaceId() != null)
//                        .map(f -> PlanDetailDto.PlanPlaceDetailDto.builder()
//                                .planPlaceId(f.getPlanPlaceId())
//                                .placeImage(f.getPlaceImage())
//                                .placeName(f.getPlaceName())
//                                .address(f.getAddress())
//                                .travelTime(f.getTravelTime())
//                                .orderIndex(f.getOrderIndex())
//                                .isStamped(f.getIsStamped())
//                                .build())
//                        .toList();
//
//        return PlanDetailDto.builder()
//                .planId(first.getPlanId())
//                .planTitle(first.getPlanTitle())
//                .tripDate(first.getTripDate())
//                .createAt(first.getCreateAt())
//                .isPlanVisible(first.getIsPlanVisible())
//                .planDescription(first.getPlanDescription())
//                .planPlaceDetailDtos(places)
//                .build();
//    }
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
