package com.begae.backend.place.controller;

import com.begae.backend.global.handler.GlobalExceptionHandler;
import com.begae.backend.global.location.PopularRegion;
import com.begae.backend.like.service.LikeService;
import com.begae.backend.place.dto.PopularPlaceResponseDto;
import com.begae.backend.place.service.PlaceReviewService;
import com.begae.backend.place.service.PlaceService;
import com.begae.backend.place.service.RecommendService;
import com.begae.backend.place.service.ScrappedPlaceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class PlacePopularControllerTest {

    private MockMvc mockMvc;
    private PlaceService placeService;

    @BeforeEach
    void setUp() {
        placeService = mock(PlaceService.class);
        PlaceController controller = new PlaceController(
                placeService,
                mock(RecommendService.class),
                mock(LikeService.class),
                mock(ScrappedPlaceService.class),
                mock(PlaceReviewService.class));
        mockMvc = standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void region만으로_지역_인기_장소를_조회한다() throws Exception {
        when(placeService.getPopularPlacesByRegion(PopularRegion.JEONBUK, 5, 1))
                .thenReturn(PopularPlaceResponseDto.of(List.of(), 1, 5, 7));

        mockMvc.perform(get("/api/place/popular")
                        .param("region", "전북특별자치도"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(7));
    }

    @Test
    void 지역과_좌표가_없으면_전국_인기_장소를_조회한다() throws Exception {
        when(placeService.getNationwidePopularPlaces(5, 1))
                .thenReturn(PopularPlaceResponseDto.of(List.of(), 1, 5, 9));

        mockMvc.perform(get("/api/place/popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(9));
    }

    @Test
    void 위도와_경도_중_하나만_오면_400이다() throws Exception {
        mockMvc.perform(get("/api/place/popular").param("lat", "37.5"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("잘못된 입력값입니다."));
    }

    @Test
    void 지원하지_않는_region은_400이다() throws Exception {
        mockMvc.perform(get("/api/place/popular").param("region", "서울숲"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("잘못된 입력값입니다."));
    }
}
