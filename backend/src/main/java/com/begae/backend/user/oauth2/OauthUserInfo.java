package com.begae.backend.user.oauth2;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

public class OauthUserInfo {

    public static String OAUTH_ACCOUNT = "";
    public static final String EMAIL = "email";


    private Map<String, Object> attributes;

    public OauthUserInfo(Map<String, Object> attributes, String account) {
        OAUTH_ACCOUNT = account;
        this.attributes = attributes;
    }

    public String getEmail() {
        ObjectMapper objectMapper = new ObjectMapper();
        TypeReference<Map<String, Object>> typeReferencer = new TypeReference<Map<String, Object>>() {
        }; // 정확한 타입 변환 정보 제공

        Object oauthAccount = attributes.get(OAUTH_ACCOUNT);
        Map<String, Object> account = objectMapper.convertValue(oauthAccount, typeReferencer);
        // Object 타입 캐스팅 안정성을 높이기 위해 Mapper를 이용해 변환
        if(account != null) {
            return (String) account.get(EMAIL);
        }
        return (String) attributes.get(EMAIL);

    }
}
