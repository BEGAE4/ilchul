package com.begae.backend.plan.controller;

import com.begae.backend.global.handler.GlobalExceptionHandler;
import com.begae.backend.global.location.PopularRegion;
import com.begae.backend.plan.dto.PopularPlanResponseDto;
import com.begae.backend.plan.service.PlanService;
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

class PlanPopularControllerTest {

    private MockMvc mockMvc;
    private PlanService planService;

    @BeforeEach
    void setUp() {
        planService = mock(PlanService.class);
        mockMvc = standaloneSetup(new PlanController(planService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void region만으로_한_장소라도_해당_지역인_인기_플랜을_조회한다() throws Exception {
        when(planService.getPopularPlansByRegion(PopularRegion.GANGWON, 5, 1))
                .thenReturn(PopularPlanResponseDto.of(List.of(), 1, 5, 6));

        mockMvc.perform(get("/api/plan/popular")
                        .param("region", "강원"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(6));
    }

    @Test
    void 지역과_좌표가_없으면_전국_인기_플랜을_조회한다() throws Exception {
        when(planService.getNationwidePopularPlans(5, 1))
                .thenReturn(PopularPlanResponseDto.of(List.of(), 1, 5, 8));

        mockMvc.perform(get("/api/plan/popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(8));
    }

    @Test
    void 위도와_경도_중_하나만_오면_400이다() throws Exception {
        mockMvc.perform(get("/api/plan/popular").param("lng", "127.0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("잘못된 입력값입니다."));
    }
}
