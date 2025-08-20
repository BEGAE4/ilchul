package com.begae.backend.user.service;

import com.begae.backend.user.auth.OauthUserDetails;
import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.common.UserRole;
import com.begae.backend.user.common.UserStatus;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.oauth2.OauthUserInfo;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class CustomUserDetailsService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;


    // 로그인 성공 후 동작하는 메서드
    @Transactional
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest); // request로부터 사용자 정보 받아오기
        SocialType socialType = null;
        String account = "";
        switch(userRequest.getClientRegistration().getRegistrationId()) {
            case "kakao":
                socialType = SocialType.SOCIAL_KAKAO;
                account = "kakao_account";
                break;
            case "google":
                socialType = SocialType.SOCIAL_GOOGLE;
                break;
            case "naver":
                socialType = SocialType.SOCIAL_NAVER;
                account = "response";
                break;
        }
        OauthUserInfo oauthUserInfo = new OauthUserInfo(oAuth2User.getAttributes(), account,
                userRequest.getClientRegistration().getRegistrationId()); // 사용자 정보 객체 담기
        // attributes는 Map<String, Map<String, String>> 의 형태
        // UserInfo 클래스를 통해 변환하여 email을 꺼내옴
        SocialType type = socialType;
        Map<String, String> userInfo = oauthUserInfo.getUserInfo();
        User user = userRepository.findByUserEmailAndSocialType(userInfo.get("email"), type)
                .orElseGet(() ->
                        userRepository.save(
                                User.builder()
                                        .userEmail(userInfo.get("email"))
                                        .socialType(type)
                                        .userNickname(userInfo.get("nickname"))
                                        .userRole(UserRole.ROLE_USER)
                                        .userStatus(UserStatus.STATUS_AVAILABLE)
                                        .build()
                        ));

        // UserDetails에 담기 위한 권한 정보
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(user.getUserRole().name());

        // 사용자 인증 정보 반환 -> Authentication 객체에 담김(인증 상태) -> SecurityContext에 저장
        return new OauthUserDetails(String.valueOf(user.getUserEmail()),
                Collections.singletonList(authority),
                oAuth2User.getAttributes());
    }
}
