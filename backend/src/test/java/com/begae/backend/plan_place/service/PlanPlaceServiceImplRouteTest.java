package com.begae.backend.plan_place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.domain.Place;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.dto.DeparturePointDto;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.plan_place.dto.*;
import com.begae.backend.plan_place.repository.*;
import com.begae.backend.storage.service.*;
import com.begae.backend.trip.TripRouteCalculator;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.*;
import org.springframework.http.HttpStatus;
import reactor.core.publisher.Mono;
import java.time.LocalDateTime;
import java.util.List;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

class PlanPlaceServiceImplRouteTest {
    private final PlaceRepository places = mock(PlaceRepository.class);
    private PlanPlaceServiceImpl service(WebClient client) {
        return new PlanPlaceServiceImpl(mock(PlanPlaceRepository.class), mock(PlanRepository.class), places,
                mock(PlanPlaceImageRepository.class), mock(PlanService.class), mock(ImageStorageService.class),
                mock(ImageFileCleaner.class), client, mock(WebClient.class), new TripRouteCalculator(client));
    }
    private Place place(int id, double x) {
        Place place = Place.builder().placeName("장소" + id).x(x).y(37.5).build();
        ReflectionTestUtils.setField(place, "placeId", id); return place;
    }
    private CreatePlanPreviewRequestDto request(int... ids) {
        var request = new CreatePlanPreviewRequestDto();
        request.setTransport("도보"); request.setTransportTime("1시간 이내");
        request.setTripStartDate(LocalDateTime.of(2026, 10, 2, 10, 0));
        request.setTripEndDate(request.getTripStartDate().plusHours(4));
        request.setDeparturePoint(new DeparturePointDto("출발", "", 127.0, 37.5));
        var stops = new java.util.ArrayList<CreatePlanPreviewRequestDto.Place>();
        for (int i = 0; i < ids.length; i++) {
            var stop = new CreatePlanPreviewRequestDto.Place(); stop.setPlaceId(ids[i]); stop.setOrder(i + 1); stop.setStayTime(60); stops.add(stop);
        }
        request.setPlaces(stops); return request;
    }
    @Test void databaseOrderDoesNotMixPlaceIdentityAndLegTimes() {
        when(places.findAllById(anyList())).thenReturn(List.of(place(2, 127.002), place(1, 127.001)));
        var result = service(WebClient.create()).createPlanPreview(request(1, 2));
        assertThat(result.getPlaces()).extracting(CreatePlanPreviewResponseDto.PlanPlacePreview::getPlaceId).containsExactly(1, 2);
        assertThat(result.getPlaces().getFirst().getDuration()).isEqualTo(result.getTimeSummary().legMinutes().getFirst());
        assertThat(result.getRequiredTime()).isEqualTo(result.getTimeSummary().totalMinutes());
        assertThat(result.getTimeSummary().returnMinutes()).isPositive();
    }
    @Test void missingPlaceAndDuplicateIdsAreRejected() {
        when(places.findAllById(anyList())).thenReturn(List.of(place(1, 127.0)));
        assertThatThrownBy(() -> service(WebClient.create()).createPlanPreview(request(1, 2))).isInstanceOf(CustomException.class);
        assertThatThrownBy(() -> service(WebClient.create()).createPlanPreview(request(1, 1))).isInstanceOf(CustomException.class);
    }
    @Test void routeFailureBlocksPreviewInsteadOfZeroMinutes() {
        when(places.findAllById(anyList())).thenReturn(List.of(place(1, 127.01)));
        var client = WebClient.builder().exchangeFunction(r -> Mono.just(ClientResponse.create(HttpStatus.OK)
                .header("Content-Type", "application/json").body("{\"routes\":[{\"result_code\":104}]}").build())).build();
        var request = request(1); request.setTransport("자가용");
        assertThatThrownBy(() -> service(client).createPlanPreview(request)).isInstanceOf(CustomException.class)
                .hasMessageContaining("경로를 계산하지 못했어요");
    }
}
