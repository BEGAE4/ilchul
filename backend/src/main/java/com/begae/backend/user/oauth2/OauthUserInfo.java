package com.begae.backend.user.oauth2;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class OauthUserInfo {

    public static String OAUTH_ACCOUNT = "";
    public static final String EMAIL = "email";
    public static final String NICKNAME = "nickname";
    public static String CLIENT = "";


    private Map<String, Object> attributes;

    public OauthUserInfo(Map<String, Object> attributes, String account, String client) {
        OAUTH_ACCOUNT = account;
        CLIENT = client;
        this.attributes = attributes;
    }

    public Map<String, String> getUserInfo() {
        ObjectMapper objectMapper = new ObjectMapper();
        TypeReference<Map<String, Object>> typeReferencer = new TypeReference<Map<String, Object>>() {
        }; // 정확한 타입 변환 정보 제공

        Map<String, String> userInfo = new HashMap<>();

        Object oauthAccount = attributes.get(OAUTH_ACCOUNT);
        Map<String, Object> account = objectMapper.convertValue(oauthAccount, typeReferencer);
        // Object 타입 캐스팅 안정성을 높이기 위해 Mapper를 이용해 변환
        if(account != null) {
            if(CLIENT.equals("kakao")) {
                Map<String, Object> profile = objectMapper.convertValue(account.get("profile"), typeReferencer);
                userInfo.put(NICKNAME, (String) profile.get(NICKNAME));
            } else userInfo.put(NICKNAME, (String) account.get(NICKNAME));
            userInfo.put(EMAIL, (String) account.get(EMAIL));
            return userInfo;
        }
        userInfo.put(NICKNAME, (String) attributes.get("name"));
        userInfo.put(EMAIL, (String) attributes.get(EMAIL));
        return userInfo;
    }

}
