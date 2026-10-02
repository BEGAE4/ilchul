package com.begae.backend.plan.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.like.repository.LikeRepository;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.dto.PlanDetailFlatDto;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanImageRepository;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.plan_place.repository.PlanPlaceImageRepository;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PlanServiceImplAccessTest {

    private static final int OWNER_ID = 1;
    private static final int OTHER_USER_ID = 2;
    private static final int PLAN_ID = 10;

    private final PlanRepository planRepository = mock(PlanRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private PlanServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PlanServiceImpl(
                planRepository,
                userRepository,
                mock(PlaceRepository.class),
                mock(PlanPlaceRepository.class),
                mock(LikeRepository.class),
                mock(ScrappedPlanRepository.class),
                mock(PlanImageRepository.class),
                mock(ImageStorageService.class),
                mock(PlanPlaceImageRepository.class),
                mock(ImageFileCleaner.class),
                mock(com.begae.backend.trip.TripRouteCalculator.class)
        );
        when(userRepository.findById(OTHER_USER_ID)).thenReturn(Optional.of(user(OTHER_USER_ID)));
    }

    @Test
    void 작성자가_아니면_비공개_플랜_상세를_볼_수_없다() {
        givenPlan(false, false);

        assertThatThrownBy(() -> service.getPlanDetail(PLAN_ID, OTHER_USER_ID))
                .isInstanceOf(CustomException.class)
                .extracting("errorCode").isEqualTo(PlanErrorCode.PLAN_PRIVATE);
    }

    @Test
    void 작성자가_아니면_블라인드된_플랜_상세를_볼_수_없다() {
        givenPlan(true, true);

        assertThatThrownBy(() -> service.getPlanDetail(PLAN_ID, OTHER_USER_ID))
                .isInstanceOf(CustomException.class)
                .extracting("errorCode").isEqualTo(PlanErrorCode.PLAN_BLINDED);
    }

    @Test
    void 작성자는_비공개거나_블라인드된_자신의_플랜_상세를_볼_수_있다() {
        givenPlan(false, true);

        assertThat(service.getPlanDetail(PLAN_ID, OWNER_ID).getPlanId()).isEqualTo(PLAN_ID);
    }

    @Test
    void 공개_플랜_상세는_다른_사용자도_볼_수_있다() {
        givenPlan(true, false);

        assertThat(service.getPlanDetail(PLAN_ID, OTHER_USER_ID).getPlanId()).isEqualTo(PLAN_ID);
    }

    @Test
    void 작성자가_아니면_비공개_플랜을_복제할_수_없다() {
        Plan plan = givenPlan(false, false);
        when(planRepository.findByIdWithLock(PLAN_ID)).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> service.copyPlan(PLAN_ID, null, OTHER_USER_ID))
                .isInstanceOf(CustomException.class)
                .extracting("errorCode").isEqualTo(PlanErrorCode.PLAN_PRIVATE);
        verify(planRepository, never()).save(any(Plan.class));
    }

    @Test
    void 비로그인_공개_플랜은_반응_여부가_false다() {
        givenPlan(true, false);
        var response = service.getPlanDetail(PLAN_ID, null);
        assertThat(response.getIsLiked()).isFalse();
        assertThat(response.getIsBookmarked()).isFalse();
    }

    @Test
    void 비로그인_비공개_플랜은_차단한다() {
        givenPlan(false, false);
        assertThatThrownBy(() -> service.getPlanDetail(PLAN_ID, null))
                .isInstanceOf(CustomException.class).extracting("errorCode").isEqualTo(PlanErrorCode.PLAN_PRIVATE);
    }

    @Test
    void 복제와_일정_저장이_한번에_이뤄진다() throws Exception {
        Plan source = givenPlan(true, false);
        when(planRepository.findByIdWithLock(PLAN_ID)).thenReturn(Optional.of(source));
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules();
        var request = mapper.readValue("""
                {"tripStartDate":"2026-10-01 09:30","tripEndDate":"2026-10-02 11:00"}
                """, com.begae.backend.plan.dto.PlanCopyRequestDto.class);
        var response = service.copyPlan(PLAN_ID, request, OTHER_USER_ID);
        var captor = org.mockito.ArgumentCaptor.forClass(Plan.class);
        verify(planRepository).save(captor.capture());
        assertThat(captor.getValue().getTripStartDate()).isEqualTo(request.getTripStartDate());
        assertThat(captor.getValue().getTripEndDate()).isEqualTo(request.getTripEndDate());
        assertThat(response.getTripStartDate()).isEqualTo(request.getTripStartDate());
        assertThat(response.getTripEndDate()).isEqualTo(request.getTripEndDate());
        assertThat(captor.getValue().getIsPlanVisible()).isFalse();
        assertThat(source.getTripStartDate()).isNull();
    }

    @Test
    void 복제_일정이_역전되거나_한쪽만_있으면_저장하지_않는다() {
        Plan source = givenPlan(true, false);
        when(planRepository.findByIdWithLock(PLAN_ID)).thenReturn(Optional.of(source));
        var start = java.time.LocalDateTime.of(2026, 10, 1, 9, 30);
        for (var request : List.of(
                new com.begae.backend.plan.dto.PlanCopyRequestDto(null, start, start.minusMinutes(1)),
                new com.begae.backend.plan.dto.PlanCopyRequestDto(null, start, null))) {
            assertThatThrownBy(() -> service.copyPlan(PLAN_ID, request, OTHER_USER_ID))
                    .isInstanceOf(CustomException.class);
        }
        verify(planRepository, never()).save(any());
    }

    @Test
    void 기존_날짜만_보내는_복제도_소요시간을_반영한다() {
        Plan source = givenPlan(true, false);
        ReflectionTestUtils.setField(source, "requiredTime", 90);
        when(planRepository.findByIdWithLock(PLAN_ID)).thenReturn(Optional.of(source));
        var date = java.time.LocalDate.of(2026, 10, 1);
        var response = service.copyPlan(PLAN_ID,
                new com.begae.backend.plan.dto.PlanCopyRequestDto(date, null, null), OTHER_USER_ID);
        assertThat(response.getTripStartDate()).isEqualTo(date.atStartOfDay());
        assertThat(response.getTripEndDate()).isEqualTo(date.atTime(1, 30));
    }

    private Plan givenPlan(boolean visible, boolean blinded) {
        Plan plan = Plan.builder()
                .planId(PLAN_ID)
                .user(user(OWNER_ID))
                .isPlanVisible(visible)
                .isBlinded(blinded)
                .build();
        when(planRepository.findById(PLAN_ID)).thenReturn(Optional.of(plan));
        when(planRepository.findPlanDetailFlat(PLAN_ID)).thenReturn(List.of(new PlanDetailFlatDto(
                PLAN_ID, "플랜", null, null, null, false, visible, null,
                null, null,
                0, 0, OWNER_ID, "owner", null,
                null, null, null, null, null, null, null, null, null, null, null
        )));
        return plan;
    }

    private static User user(int userId) {
        User user = User.builder().userNickname("user" + userId).build();
        ReflectionTestUtils.setField(user, "userId", userId);
        return user;
    }
}
