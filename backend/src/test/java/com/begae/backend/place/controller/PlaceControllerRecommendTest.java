package com.begae.backend.place.controller;

import com.begae.backend.global.handler.GlobalExceptionHandler;
import com.begae.backend.like.service.LikeService;
import com.begae.backend.place.dto.RecommendResponseDto;
import com.begae.backend.place.service.PlaceReviewService;
import com.begae.backend.place.service.PlaceService;
import com.begae.backend.place.service.RecommendService;
import com.begae.backend.place.service.ScrappedPlaceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class PlaceControllerRecommendTest {

    private MockMvc mockMvc;
    private RecommendService recommendService;

    @BeforeEach
    void setUp() {
        recommendService = mock(RecommendService.class);
        PlaceController controller = new PlaceController(
                mock(PlaceService.class),
                recommendService,
                mock(LikeService.class),
                mock(ScrappedPlaceService.class),
                mock(PlaceReviewService.class));
        mockMvc = standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
    }

    @Test
    void 문서화된_문자열_transportTime을_받는다() throws Exception {
        when(recommendService.recommend(any())).thenReturn(RecommendResponseDto.builder()
                .recommendId("rc_test")
                .items(List.of())
                .build());

        mockMvc.perform(post("/api/place/recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recommendId").value("rc_test"));
    }

    @Test
    void 필수_location이_없으면_400이다() throws Exception {
        mockMvc.perform(post("/api/place/recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "emotion": "울적해요",
                                  "startTime": "2026-08-20 15:00",
                                  "endTime": "2026-08-20 22:00",
                                  "transport": "도보",
                                  "transportTime": "상관없어요"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("잘못된 입력값입니다."));

        verifyNoInteractions(recommendService);
    }

    @Test
    void 좌표가_범위를_벗어나면_400이다() throws Exception {
        mockMvc.perform(post("/api/place/recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest().replace("127.0812", "181.0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("잘못된 입력값입니다."));

        verifyNoInteractions(recommendService);
    }

    @Test
    void JSON이_깨졌으면_500이_아니라_400이다() throws Exception {
        mockMvc.perform(post("/api/place/recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"emotion\":"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("잘못된 입력값입니다."));

        verifyNoInteractions(recommendService);
    }

    private String validRequest() {
        return """
                {
                  "emotion": "울적해요",
                  "startTime": "2026-08-20 15:00",
                  "endTime": "2026-08-20 22:00",
                  "transport": "도보",
                  "transportTime": "1시간 이내",
                  "location": { "x": 127.0812, "y": 37.5372 }
                }
                """;
    }
}
