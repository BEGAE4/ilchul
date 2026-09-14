package com.begae.backend.storage.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

@ConfigurationProperties(prefix = "cloud.aws.s3")
public record S3StorageProperties(String endpoint,
                                  String bucket,
                                  String region,
                                  String publicBaseUrl) {

    /**
     * 환경변수가 없으면 설정 바인딩이 "${STORAGE_PUBLIC_URL}" 문자열을 그대로 넘기므로 미치환 값도 미설정으로 본다.
     */
    public boolean hasPublicBaseUrl() {
        return StringUtils.hasText(publicBaseUrl) && !publicBaseUrl.contains("${");
    }

    public String normalizedPublicBaseUrl() {
        if (!hasPublicBaseUrl()) {
            throw new IllegalStateException("S3 public base URL이 설정되지 않았습니다. STORAGE_PUBLIC_URL 환경변수를 확인하세요.");
        }

        return publicBaseUrl.replaceAll("/+$", "");
    }

}
