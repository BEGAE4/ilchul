package com.begae.backend.config;

import com.begae.backend.global.filter.JwtFilter;
import com.begae.backend.global.handler.*;
import com.begae.backend.global.security.jwt.JwtManager;
import com.begae.backend.global.security.principal.CustomUserDetailsService;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

@WebMvcTest(PublicReadSecurityTest.Probe.class)
@Import({SecurityConfig.class, JwtFilter.class, JwtAuthenticationFailEntryPoint.class, JwtAccessDeniedHandler.class,
        PublicReadSecurityTest.Probe.class})
@ActiveProfiles("test")
class PublicReadSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean JwtManager jwtManager;
    @MockitoBean CustomUserDetailsService userDetailsService;
    @MockitoBean CustomOauth2SuccessHandler successHandler;
    @MockitoBean CustomOauth2FailureHandler failureHandler;

    @RestController
    static class Probe {
        @RequestMapping("/api/**") String ok() { return "ok"; }
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/search", "/api/search/popular", "/api/search/autocomplete", "/api/place/search",
            "/api/place/1", "/api/place/1/review", "/api/place/1/plan", "/api/plan/1", "/api/reply/1",
            "/api/reply/1/children", "/api/profile/1", "/api/profile/1/summary", "/api/profile/1/plans",
            "/api/place/popular", "/api/place/popular/nationwide", "/api/plan/popular", "/api/region"})
    void 공개_GET은_비로그인으로_접근한다(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isOk());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/search/recent", "/api/mypage/plans", "/api/mypage/scrapped", "/api/place/recommend",
            "/api/plan/create", "/api/profile/1/private", "/api/admin/users"})
    void 개인_조회와_미허용_경로는_로그인을_요구한다(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/place/1/likes", "/api/place/1/scraps", "/api/place/1/review", "/api/plan/1",
            "/api/plan/1/clone", "/api/plan/create", "/api/reply/1", "/api/reply/like/1", "/api/report",
            "/api/search/recent", "/api/place/popular", "/api/plan/popular", "/api/region"})
    void 쓰기는_로그인을_요구하고_로그인하면_통과한다(String path) throws Exception {
        mvc.perform(post(path)).andExpect(status().isUnauthorized());
        mvc.perform(patch(path)).andExpect(status().isUnauthorized());
        mvc.perform(delete(path)).andExpect(status().isUnauthorized());
        mvc.perform(post(path).with(user("viewer"))).andExpect(status().isOk());
    }
}
