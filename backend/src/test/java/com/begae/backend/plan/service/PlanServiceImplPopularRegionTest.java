package com.begae.backend.plan.service;

import com.begae.backend.global.location.PopularRegion;
import com.begae.backend.like.repository.LikeRepository;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.dto.PopularPlanResponseDto;
import com.begae.backend.plan.repository.PlanImageRepository;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.plan_place.repository.PlanPlaceImageRepository;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import com.begae.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PlanServiceImplPopularRegionTest {

    @Test
    void 지역의_주소_접두어로_플랜을_조회한다() {
        PlanRepository repository = mock(PlanRepository.class);
        when(repository.findPopularPlanIdsByRegion("강원", "강원", 5, 0))
                .thenReturn(List.of());
        when(repository.countPopularPlansByRegion("강원", "강원"))
                .thenReturn(2);
        PlanServiceImpl service = new PlanServiceImpl(
                repository,
                mock(UserRepository.class),
                mock(PlaceRepository.class),
                mock(PlanPlaceRepository.class),
                mock(LikeRepository.class),
                mock(ScrappedPlanRepository.class),
                mock(PlanImageRepository.class),
                mock(ImageStorageService.class),
                mock(PlanPlaceImageRepository.class),
                mock(ImageFileCleaner.class));

        PopularPlanResponseDto response = service.getPopularPlansByRegion(
                PopularRegion.GANGWON, 5, 1);

        assertThat(response.getTotalCount()).isEqualTo(2);
        assertThat(response.getData()).isEmpty();
    }
}
