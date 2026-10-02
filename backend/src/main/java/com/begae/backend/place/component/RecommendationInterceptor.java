package com.begae.backend.place.component;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.global.security.principal.OauthUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RecommendationInterceptor implements HandlerInterceptor {
    private static final String LEASE = RecommendationInterceptor.class.getName() + ".lease";
    private final RecommendationGuard guard;
    public RecommendationInterceptor(RecommendationGuard guard) { this.guard = guard; }
    @Override public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!"POST".equals(request.getMethod())) return true;
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof OauthUserDetails user))
            throw new CustomException(GlobalErrorCode.UNAUTHORIZED);
        request.setAttribute(LEASE, guard.acquire(user.getUserId()));
        return true;
    }
    @Override public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception exception) {
        if (request.getAttribute(LEASE) instanceof RecommendationGuard.Lease lease) lease.close();
    }
}
