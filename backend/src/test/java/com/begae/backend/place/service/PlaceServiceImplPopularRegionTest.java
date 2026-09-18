package com.begae.backend.place.service;

import com.begae.backend.global.location.PopularRegion;
import com.begae.backend.like.repository.LikeRepository;
import com.begae.backend.place.dto.PopularPlaceResponseDto;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.place.repository.ScrappedPlaceRepository;
import com.begae.backend.plan.repository.PlanRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PlaceServiceImplPopularRegionTest {

    @Test
    void 지역의_현재와_과거_주소_접두어로_조회한다() {
        PlaceRepository repository = mock(PlaceRepository.class);
        when(repository.findPopularPlaceIdsByRegion("전북", "전라북", 5, 0))
                .thenReturn(List.of());
        when(repository.countPopularPlacesByRegion("전북", "전라북"))
                .thenReturn(2);
        PlaceServiceImpl service = new PlaceServiceImpl(
                mock(WebClient.class),
                mock(WebClient.class),
                repository,
                mock(LikeRepository.class),
                mock(ScrappedPlaceRepository.class),
                mock(PlanRepository.class),
                mock(PlaceUpsertWriter.class));

        PopularPlaceResponseDto response = service.getPopularPlacesByRegion(
                PopularRegion.JEONBUK, 5, 1);

        assertThat(response.getTotalCount()).isEqualTo(2);
        assertThat(response.getData()).isEmpty();
    }
}
