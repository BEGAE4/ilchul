package com.begae.backend.global.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Set;

@Component
public class CustomOauth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private static final String CALLBACK_PREFIX = "/login/oauth2/code/";
    private static final Set<String> PROVIDERS = Set.of("kakao", "google", "naver");

    private final String failureUri;

    public CustomOauth2FailureHandler(@Value("${oauth.failure-uri}") String failureUri) {
        this.failureUri = failureUri;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        String provider = resolveProvider(request);
        String reason = isCancelled(request, exception) ? "cancelled" : "failed";
        String error = provider == null ? "oauth_failed" : provider + "_" + reason;
        String targetUrl = UriComponentsBuilder.fromUriString(failureUri)
                .replaceQueryParam("error", error)
                .build()
                .encode()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String resolveProvider(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (!path.startsWith(CALLBACK_PREFIX)) {
            return null;
        }
        String provider = path.substring(CALLBACK_PREFIX.length());
        return PROVIDERS.contains(provider) ? provider : null;
    }

    private boolean isCancelled(HttpServletRequest request, AuthenticationException exception) {
        // A cancelled callback may arrive after the authorization session has expired.
        if (OAuth2ErrorCodes.ACCESS_DENIED.equals(request.getParameter("error"))) {
            return true;
        }
        return exception instanceof OAuth2AuthenticationException oauthException
                && OAuth2ErrorCodes.ACCESS_DENIED.equals(oauthException.getError().getErrorCode());
    }
}
