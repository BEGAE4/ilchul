package com.begae.backend.global.aop.require_admin;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.user.auth.OauthUserDetails;
import com.begae.backend.user.common.UserRole;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class RequireAdminAspect {

    @Before("@annotation(com.begae.backend.global.aop.require_admin.RequireAdmin)")
    public void checkAdminRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new CustomException(GlobalErrorCode.ADMIN_ACCESS_DENIED);
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof OauthUserDetails)) {
            throw new CustomException(GlobalErrorCode.ADMIN_ACCESS_DENIED);
        }

        OauthUserDetails userDetails = (OauthUserDetails) principal;

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(UserRole.ROLE_ADMIN.name()));

        if (!isAdmin) {
            throw new CustomException(GlobalErrorCode.ADMIN_ACCESS_DENIED);
        }
    }
}
