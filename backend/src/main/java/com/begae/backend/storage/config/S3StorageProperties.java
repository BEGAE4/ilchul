package com.begae.backend.storage.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

@ConfigurationProperties(prefix = "cloud.aws.s3")
public record S3StorageProperties(String endpoint,
                                  String bucket,
                                  String region,
                                  String publicBaseUrl) {

    public String normalizedPublicBaseUrl() {
        if (!StringUtils.hasText(publicBaseUrl)) {
            throw new IllegalStateException("S3 public base URL이 설정되지 않았습니다.");
        }

        return publicBaseUrl.replaceAll("/+$", "");
    }

}
