package com.begae.backend.global.security.oauth2;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class OauthUserInfo {

    public static final String EMAIL = "email";
    public static final String NICKNAME = "nickname";
    public static final String PROFILE_IMAGE = "profile_image";

    private final Map<String, Object> attributes;
    private final String oauthAccountKey;
    private final String client;

    public OauthUserInfo(Map<String, Object> attributes, String oauthAccountKey, String client) {
        this.attributes = attributes;
        this.oauthAccountKey = oauthAccountKey;
        this.client = client;
    }

    public Map<String, String> getUserInfo() {
        ObjectMapper objectMapper = new ObjectMapper();
        TypeReference<Map<String, Object>> typeReferencer = new TypeReference<Map<String, Object>>() {
        };

        Map<String, String> userInfo = new HashMap<>();

        // 구글처럼 최상위에 정보가 있는 경우 attributes 자체를 사용하고,
        // 카카오/네이버처럼 특정 키(kakao_account, response) 아래에 정보가 있는 경우 해당 객체를 꺼냅니다.
        Object oauthAccount = (oauthAccountKey == null || oauthAccountKey.isEmpty()) 
                ? attributes 
                : attributes.get(oauthAccountKey);
                
        Map<String, Object> account = objectMapper.convertValue(oauthAccount, typeReferencer);

        if (account != null) {
            switch (client) {
                case "kakao":
                    Map<String, Object> kakaoProfile = objectMapper.convertValue(account.get("profile"), typeReferencer);
                    if (kakaoProfile != null) {
                        userInfo.put(NICKNAME, (String) kakaoProfile.get("nickname"));
                        userInfo.put(PROFILE_IMAGE, (String) kakaoProfile.get("profile_image_url"));
                    }
                    break;
                case "naver":
                    userInfo.put(NICKNAME, (String) account.get("nickname"));
                    userInfo.put(PROFILE_IMAGE, (String) account.get("profile_image"));
                    break;
                case "google":
                    userInfo.put(NICKNAME, (String) account.get("name"));
                    userInfo.put(PROFILE_IMAGE, (String) account.get("picture"));
                    break;
            }
            userInfo.put(EMAIL, (String) account.get(EMAIL));
        }
        
        return userInfo;
    }
}
