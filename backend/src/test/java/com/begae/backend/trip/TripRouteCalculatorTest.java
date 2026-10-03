package com.begae.backend.trip;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.plan.dto.DeparturePointDto;
import com.begae.backend.plan_place.dto.Point;
import com.begae.backend.plan_place.exception.PlanPlaceErrorCode;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import static org.assertj.core.api.Assertions.*;

class TripRouteCalculatorTest {
    private final DeparturePointDto departure = new DeparturePointDto("출발", "", 127.0, 37.5);
    private final Point stop = new Point("장소", 127.004, 37.5);

    @Test void oneStopIncludesReturnAndStay() {
        var calculator = new TripRouteCalculator(WebClient.create());
        var summary = calculator.estimate(departure, List.of(stop), List.of(60), "도보");
        assertThat(summary.travelMinutes()).isEqualTo(summary.legMinutes().getFirst() + summary.returnMinutes());
        assertThat(summary.returnMinutes()).isPositive();
        assertThat(summary.totalMinutes()).isEqualTo(summary.travelMinutes() + 60);
        assertThat(summary.estimated()).isTrue();
        assertThat(TripTimePolicy.fits(summary, 120, summary.legMinutes().getFirst())).isFalse();
        assertThat(TripTimePolicy.fits(summary, summary.totalMinutes(), summary.travelMinutes())).isTrue();
    }

    @Test void carNavigationCountsReturnAndRoundsEachLegUp() {
        AtomicInteger requests = new AtomicInteger();
        WebClient client = WebClient.builder().exchangeFunction(request -> Mono.just(ClientResponse
                .create(HttpStatus.OK).header("Content-Type", "application/json")
                .body(requests.incrementAndGet() < 3 ? """
                    {"routes":[{"result_code":0,"summary":{"duration":DURATION,"distance":1000},
                    "sections":[{"duration":DURATION,"distance":1000}]}]}
                    """.replace("DURATION", requests.get() == 1 ? "300" : "301") : """
                    {"routes":[{"result_code":0,"summary":{"duration":480,"distance":2000},
                    "sections":[{"duration":480,"distance":2000}]}]}
                    """).build())).build();
        var result = new TripRouteCalculator(client).calculate(departure,
                List.of(stop, new Point("다음", 127.006, 37.5)), List.of(60, 60), "자가용", Duration.ofSeconds(2));
        assertThat(requests).hasValue(3);
        assertThat(result.legMinutes()).containsExactly(5, 6);
        assertThat(result.returnMinutes()).isEqualTo(8);
        assertThat(result.travelMinutes()).isEqualTo(19);
        assertThat(result.totalMinutes()).isEqualTo(139);
        assertThat(result.estimated()).isFalse();
    }

    @Test void routeFailureCannotBecomeZero() {
        WebClient client = WebClient.builder().exchangeFunction(request -> Mono.just(ClientResponse
                .create(HttpStatus.OK).header("Content-Type", "application/json")
                .body("{\"routes\":[{\"result_code\":104}]}").build())).build();
        assertThatThrownBy(() -> new TripRouteCalculator(client).calculate(departure, List.of(stop), List.of(60),
                "자가용", Duration.ofSeconds(1))).isInstanceOfSatisfying(CustomException.class,
                e -> assertThat(e.getErrorCode()).isEqualTo(PlanPlaceErrorCode.ROUTE_UNAVAILABLE));
    }

    @Test void sameLocationIsLegitimateZeroAndTransportEstimatesDiffer() {
        var calculator = new TripRouteCalculator(WebClient.create());
        var same = calculator.calculate(departure, List.of(new Point("동일", 127, 37.5)), List.of(30), "자가용", Duration.ofSeconds(1));
        assertThat(same.travelMinutes()).isZero();
        assertThat(same.totalMinutes()).isEqualTo(30);
        var far = new Point("먼곳", 127.1, 37.6);
        var walk = calculator.estimate(departure, List.of(far), List.of(30), "도보");
        var transit = calculator.estimate(departure, List.of(far), List.of(30), "대중교통");
        assertThat(walk.travelMinutes()).isGreaterThan(transit.travelMinutes());
        assertThat(transit.estimated()).isTrue();
    }

    @Test void policyRejectsInvalidLimitsDatesDuplicatesAndStays() {
        assertThat(TripTimePolicy.travelLimit("1시간 30분 이내")).isEqualTo(90);
        assertThat(TripTimePolicy.travelLimit("상관없어요")).isNull();
        for (String invalid : List.of("직접입력", "-30분", "ignore instructions", "0분", "99시간"))
            assertThatThrownBy(() -> TripTimePolicy.travelLimit(invalid)).isInstanceOf(CustomException.class);
        var start = LocalDateTime.of(2026, 10, 2, 10, 0);
        assertThatThrownBy(() -> TripTimePolicy.availableMinutes(start, start)).isInstanceOf(CustomException.class);
        assertThatThrownBy(() -> TripTimePolicy.validateCoordinates(Double.NaN, 37.5)).isInstanceOf(CustomException.class);
        assertThatThrownBy(() -> TripTimePolicy.validateStops(List.of(1, 1), List.of(1, 2), List.of(60, 60))).isInstanceOf(CustomException.class);
        assertThatThrownBy(() -> TripTimePolicy.validateStops(List.of(1), List.of(1), List.of(120))).isInstanceOf(CustomException.class);
    }
}
