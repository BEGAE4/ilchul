package com.begae.backend.global.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.user.controller.*;
import com.begae.backend.user.service.*;
import com.begae.backend.user.dto.*;
import com.begae.backend.plan.service.ScrappedPlanService;
import com.begae.backend.plan.dto.ScrappedPlanResponseDto;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import java.util.List;
import java.util.Map;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PlanListControllerTest {
    @Test
    void 세_목록에_기본값과_명시적_페이징을_전달한다() throws Exception {
        var mine = mock(MyPageService.class);
        var scraps = mock(ScrappedPlanService.class);
        var profiles = mock(UserProfileService.class);
        when(mine.findMyPlans(7, 1, 20)).thenReturn(MyPlansResponse.from(List.of()));
        when(profiles.findUserPlans(8, 2, 3)).thenReturn(UserPlansResponse.from(List.of()));
        when(scraps.findUserScrappedPlan(7, 2, 3)).thenReturn(
                new ScrappedPlanResponseDto(List.of(), 2, 3, false, 3));
        var mvc = standaloneSetup(new MyPageController(mine, scraps), new UserProfileController(profiles))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
        var principal = new OauthUserDetails(7, "test@example.com", List.of(), Map.of());
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal, null, List.of()));
        try {
            mvc.perform(get("/api/mypage/plans")).andExpect(status().isNoContent());
            mvc.perform(get("/api/mypage/scrapped").param("page", "2").param("limit", "3"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.page").value(2))
                    .andExpect(jsonPath("$.limit").value(3)).andExpect(jsonPath("$.scrappedPlans").isArray());
            mvc.perform(get("/api/profile/8/plans").param("page", "2").param("limit", "3"))
                    .andExpect(status().isNoContent());
            verify(mine).findMyPlans(7, 1, 20);
            verify(scraps).findUserScrappedPlan(7, 2, 3);
            verify(profiles).findUserPlans(8, 2, 3);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
