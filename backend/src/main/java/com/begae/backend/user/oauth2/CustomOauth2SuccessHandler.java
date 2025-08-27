package com.begae.backend.user.oauth2;

import com.begae.backend.redis.domain.RefreshToken;
import com.begae.backend.redis.repository.RefreshTokenRedisRepository;
import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.dto.JwtDto;
import com.begae.backend.user.exception.UserNotFoundException;
import com.begae.backend.user.jwt.JwtManager;
import com.begae.backend.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CustomOauth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final String REDIRECT_URI = "http://localhost:5173/login/success";

    private final JwtManager jwtManager;
    private final UserRepository userRepository;
    private final RefreshTokenRedisRepository refreshTokenRedisRepository;

    @Transactional
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        OAuth2AuthenticationToken oauth2Token = (OAuth2AuthenticationToken) authentication;
        String account = "";
        SocialType socialType = SocialType.SOCIAL_GOOGLE;
        switch (oauth2Token.getAuthorizedClientRegistrationId()) {
            case "kakao":
                account = "kakao_account";
                socialType = SocialType.SOCIAL_KAKAO;
                break;
            case "naver":
                account = "response";
                socialType = SocialType.SOCIAL_NAVER;
                break;
        };
        OauthUserInfo oauthUserInfo = new OauthUserInfo(oAuth2User.getAttributes(), account,
                oauth2Token.getAuthorizedClientRegistrationId());

        Map<String, String> userInfo = oauthUserInfo.getUserInfo();

        User user = userRepository.findByUserEmailAndSocialType(userInfo.get("email"), socialType)
                .orElseThrow(UserNotFoundException::new);

        JwtDto jwtDto = jwtManager.createToken(user.getUserEmail(), user.getUserRole().name());

        saveRefreshTokenOnRedis(user, jwtDto);

        ResponseCookie accessToken = ResponseCookie.from("AccessToken", jwtDto.getAccessToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(jwtManager.getAccessTokenValidityTime())
                .build();

        ResponseCookie refreshToken = ResponseCookie.from("RefreshToken", jwtDto.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(jwtManager.getRefreshTokenValidityTime())
                .build();

        response.addHeader("Set-Cookie", accessToken.toString());
        response.addHeader("Set-Cookie", refreshToken.toString());

        getRedirectStrategy().sendRedirect(request, response, REDIRECT_URI);
    }

    private void saveRefreshTokenOnRedis(User user, JwtDto jwtDto) {
        List<SimpleGrantedAuthority> simpleGrantedAuthorities = new ArrayList<>();
        simpleGrantedAuthorities.add(new SimpleGrantedAuthority(user.getUserRole().name()));
        refreshTokenRedisRepository.save(RefreshToken.builder()
                .id(user.getUserEmail())
                .authorities(simpleGrantedAuthorities)
                .refreshToken(jwtDto.getRefreshToken())
                .build());
    }
}
