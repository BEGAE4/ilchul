package com.begae.backend.plan.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.like.repository.LikeRepository;
import com.begae.backend.place.domain.Place;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.dto.*;
import com.begae.backend.plan.repository.*;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.repository.*;
import com.begae.backend.storage.service.*;
import com.begae.backend.trip.TripRouteCalculator;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PlanCreationTimeTest {
    private final PlanRepository plans = mock(PlanRepository.class);
    private final PlaceRepository places = mock(PlaceRepository.class);
    private final PlanPlaceRepository stops = mock(PlanPlaceRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private PlanServiceImpl service;
    @BeforeEach void setup() {
        service = new PlanServiceImpl(plans, users, places, stops, mock(LikeRepository.class),
                mock(ScrappedPlanRepository.class), mock(PlanImageRepository.class), mock(ImageStorageService.class),
                mock(PlanPlaceImageRepository.class), mock(ImageFileCleaner.class), new TripRouteCalculator(WebClient.create()));
        var user = User.builder().userNickname("owner").build();
        ReflectionTestUtils.setField(user, "userId", 1);
        when(users.findById(1)).thenReturn(Optional.of(user));
        var place = Place.builder().placeName("카페").x(127.004).y(37.5).build();
        ReflectionTestUtils.setField(place, "placeId", 10);
        when(places.findAllById(anyList())).thenReturn(List.of(place));
        when(plans.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }
    private CreatePlanRequestDto request() {
        var request = new CreatePlanRequestDto();
        request.setPlanTitle("테스트"); request.setTransport("도보"); request.setTransportTime("30분 이내");
        request.setTripStartDate(LocalDateTime.of(2026, 10, 2, 10, 0));
        request.setTripEndDate(request.getTripStartDate().plusHours(2));
        request.setDeparturePoint(new DeparturePointDto("출발", "", 127.0, 37.5));
        request.setRequiredTime(0); request.setTotalDistance(999999);
        var stop = new CreatePlanRequestDto.CreatePlanPlaceRequest();
        stop.setPlaceId(10); stop.setOrder(1); stop.setStayTime(60); stop.setTravelTime(999999);
        request.setPlaces(List.of(stop)); return request;
    }
    @Test void finalSaveRecomputesTamperedTravelTotalAndDistance() {
        service.CreatePlanWithPlaces(1, request());
        var plan = ArgumentCaptor.forClass(Plan.class); verify(plans).save(plan.capture());
        assertThat(plan.getValue().getRequiredTime()).isEqualTo(80);
        assertThat(plan.getValue().getTotalDistance()).isEqualTo(2);
        assertThat(plan.getValue().getReturnTime()).isEqualTo(10);
        assertThat(plan.getValue().getTransport()).isEqualTo("도보");
        assertThat(plan.getValue().getTravelLimitMinutes()).isEqualTo(30);
        @SuppressWarnings("unchecked") ArgumentCaptor<List<PlanPlace>> captured = ArgumentCaptor.forClass(List.class);
        verify(stops).saveAll(captured.capture());
        assertThat(captured.getValue().getFirst().getTravelTime()).isEqualTo(10);
        assertThat(captured.getValue().getFirst().getStayTime()).isEqualTo(60);
    }
    @Test void returnInclusiveLimitIsCheckedBeforeAnySave() {
        var request = request(); request.setTransportTime("10분");
        assertThatThrownBy(() -> service.CreatePlanWithPlaces(1, request)).isInstanceOf(CustomException.class);
        verify(plans, never()).save(any()); verify(stops, never()).saveAll(any());
    }
    @Test void changedStayOrScheduleCannotBypassBudgetWithZeroRequiredTime() {
        var request = request(); request.getPlaces().getFirst().setStayTime(90);
        request.setTripEndDate(request.getTripStartDate().plusMinutes(100));
        assertThatThrownBy(() -> service.CreatePlanWithPlaces(1, request)).isInstanceOf(CustomException.class);
        verify(plans, never()).save(any());
    }
}
