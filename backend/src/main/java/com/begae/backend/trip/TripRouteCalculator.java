package com.begae.backend.trip;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.plan.dto.DeparturePointDto;
import com.begae.backend.plan_place.dto.*;
import com.begae.backend.plan_place.exception.PlanPlaceErrorCode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Component
public class TripRouteCalculator {
    private final WebClient naviClient;
    public TripRouteCalculator(@Qualifier("kakaoNaviWebClient") WebClient naviClient) {
        this.naviClient = naviClient;
    }

    public TripTimeSummary calculate(DeparturePointDto departure, List<Point> stops,
                                     List<Integer> stays, String transport, Duration timeout) {
        validate(departure, stops, stays, transport);
        if (!"자가용".equals(transport)) return estimate(departure, stops, stays, transport);
        Point origin = new Point("출발지", departure.getX(), departure.getY());
        if (stops.stream().allMatch(p -> distanceKm(origin, p) < 0.01))
            return summary(stops.stream().map(p -> 0).toList(), 0, stays, 0, false);
        long deadline = System.nanoTime() + timeout.toNanos();
        try {
            List<Integer> legs = new ArrayList<>();
            Point previous = origin;
            int distanceMeters = 0;
            for (Point stop : stops) {
                if (distanceKm(previous, stop) < 0.01) legs.add(0);
                else {
                    var leg = route(previous, stop, List.of(), remaining(deadline));
                    if (leg.getSections().size() != 1) throw new IllegalStateException("Invalid route sections");
                    legs.add(minutes(leg.getSections().getFirst().getDuration()));
                    distanceMeters += leg.getSummary().getDistance();
                }
                previous = stop;
            }
            int returnMinutes = 0;
            if (distanceKm(previous, origin) >= 0.01) {
                var back = route(previous, origin, List.of(), remaining(deadline));
                if (back.getSections().size() != 1) throw new IllegalStateException("Invalid return section");
                returnMinutes = minutes(back.getSections().getFirst().getDuration());
                distanceMeters += back.getSummary().getDistance();
            }
            return summary(legs, returnMinutes, stays, (int) Math.ceil(distanceMeters / 1000.0), false);
        } catch (RuntimeException exception) {
            // Provider errors can contain Authorization headers / URLs. Do not log their payload.
            throw new CustomException(PlanPlaceErrorCode.ROUTE_UNAVAILABLE);
        }
    }

    /** Conservative geometric estimates, not walking/transit navigation or timetable data. */
    public TripTimeSummary estimate(DeparturePointDto departure, List<Point> stops,
                                    List<Integer> stays, String transport) {
        validate(departure, stops, stays, transport);
        Point origin = new Point("출발지", departure.getX(), departure.getY());
        Point previous = origin;
        List<Integer> legs = new ArrayList<>();
        double distance = 0;
        for (Point stop : stops) {
            int minutes = estimateLeg(previous, stop, transport);
            if (minutes > 0) distance += distanceKm(previous, stop) * 1.5;
            legs.add(minutes);
            previous = stop;
        }
        int back = estimateLeg(previous, origin, transport);
        if (back > 0) distance += distanceKm(previous, origin) * 1.5;
        return summary(legs, back, stays, (int) Math.ceil(distance), true);
    }

    public int estimateLeg(Point from, Point to, String transport) {
        double distance = distanceKm(from, to);
        if (distance < 0.01) return 0;
        double speed = switch (transport) { case "도보" -> 4.0; case "대중교통" -> 15.0; default -> 25.0; };
        int allowance = switch (transport) { case "도보" -> 2; case "대중교통" -> 10; default -> 5; };
        return (int) Math.ceil(distance * 1.5 / speed * 60) + allowance;
    }

    private KakaoNaviResponseDto.Route route(Point origin, Point destination, List<Point> via, Duration timeout) {
        var request = KakaoNaviRequestDto.builder().origin(origin).destination(destination)
                .waypoints(via).priority("RECOMMEND").summary(true).build();
        var response = naviClient.post().uri("/v1/waypoints/directions").bodyValue(request)
                .retrieve().bodyToMono(KakaoNaviResponseDto.class).timeout(timeout).block();
        if (response == null || response.getRoutes() == null || response.getRoutes().isEmpty())
            throw new IllegalStateException("Missing route");
        var route = response.getRoutes().getFirst();
        if (route.getResultCode() != 0 || route.getSummary() == null || route.getSections() == null
                || route.getSummary().getDistance() < 0 || route.getSummary().getDuration() <= 0
                || route.getSections().stream().anyMatch(s -> s.getDuration() <= 0 || s.getDistance() < 0))
            throw new IllegalStateException("Unavailable route");
        return route;
    }

    private void validate(DeparturePointDto departure, List<Point> stops, List<Integer> stays, String transport) {
        TripTimePolicy.validateTransport(transport);
        if (departure == null || stops == null || stops.isEmpty() || stops.size() > TripTimePolicy.MAX_STOPS
                || stays == null || stops.size() != stays.size())
            throw new CustomException(PlanPlaceErrorCode.INVALID_PLAN_PLACE);
        TripTimePolicy.validateCoordinates(departure.getX(), departure.getY());
        for (Point point : stops) TripTimePolicy.validateCoordinates(point.x(), point.y());
        if (stays.stream().anyMatch(s -> s == null || s <= 0 || s > 1440))
            throw new CustomException(PlanPlaceErrorCode.INVALID_PLAN_PLACE);
    }

    private TripTimeSummary summary(List<Integer> legs, int back, List<Integer> stays, int distance, boolean estimated) {
        int travel = legs.stream().mapToInt(Integer::intValue).sum() + back;
        int stay = stays.stream().mapToInt(Integer::intValue).sum();
        return new TripTimeSummary(legs, back, travel, stay, travel + stay, distance, estimated);
    }
    private int minutes(int seconds) { return (int) Math.ceil(seconds / 60.0); }
    private Duration remaining(long deadline) {
        long remaining = deadline - System.nanoTime();
        if (remaining <= 0) throw new IllegalStateException("Route timeout");
        return Duration.ofNanos(remaining);
    }
    private double distanceKm(Point a, Point b) {
        double lat = Math.toRadians(b.y() - a.y()), lon = Math.toRadians(b.x() - a.x());
        double h = Math.pow(Math.sin(lat / 2), 2) + Math.cos(Math.toRadians(a.y()))
                * Math.cos(Math.toRadians(b.y())) * Math.pow(Math.sin(lon / 2), 2);
        return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
    }
}
