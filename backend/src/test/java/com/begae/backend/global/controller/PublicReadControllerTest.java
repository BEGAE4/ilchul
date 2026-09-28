package com.begae.backend.global.controller;

import com.begae.backend.plan.controller.PlanController;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.place.controller.SearchController;
import com.begae.backend.place.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicReadControllerTest {
    @Test
    void 플랜_상세와_자동완성은_인증정보가_없어도_서비스에_null을_전달한다() throws Exception {
        var plans = mock(PlanService.class);
        var autocomplete = mock(SearchAutocompleteService.class);
        var search = new SearchController(mock(SearchLogService.class), mock(PopularSearchService.class),
                autocomplete, mock(SearchResultService.class));
        var mvc = standaloneSetup(new PlanController(plans), search)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
        mvc.perform(get("/api/plan/1")).andExpect(status().isOk());
        mvc.perform(get("/api/search/autocomplete").param("keyword", "카페")).andExpect(status().isOk());
        verify(plans).getPlanDetail(1, null);
        verify(autocomplete).autocomplete(null, "카페", 5);
    }
}
