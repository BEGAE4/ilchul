package com.begae.backend.place.component;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.security.principal.OauthUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class RecommendationInterceptorTest {
    private final RecommendationGuard guard = mock(RecommendationGuard.class);
    private final RecommendationInterceptor interceptor = new RecommendationInterceptor(guard);
    @AfterEach void cleanup() { SecurityContextHolder.clearContext(); }
    @Test void anonymousRequestsCannotReachTheRecommendationQuotaOrProvider() {
        var request = new MockHttpServletRequest("POST", "/api/place/recommend");
        assertThatThrownBy(() -> interceptor.preHandle(request, new MockHttpServletResponse(), new Object()))
                .isInstanceOf(CustomException.class);
        verifyNoInteractions(guard);
    }
    @Test void authenticatedRequestUsesAccountIdAndReleasesItsLeaseOnFailure() {
        var user = new OauthUserDetails(42, "test@example.invalid", List.of(), Map.of());
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(user, null, List.of()));
        var lease = mock(RecommendationGuard.Lease.class); when(guard.acquire(42)).thenReturn(lease);
        var request = new MockHttpServletRequest("POST", "/api/place/recommend");
        var response = new MockHttpServletResponse();
        assertThat(interceptor.preHandle(request, response, new Object())).isTrue();
        interceptor.afterCompletion(request, response, new Object(), new IllegalStateException("failed"));
        verify(guard).acquire(42); verify(lease).close();
    }
}
