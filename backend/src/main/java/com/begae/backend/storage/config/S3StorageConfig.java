package com.begae.backend.storage.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(S3StorageProperties.class)
public class S3StorageConfig {

    private final S3StorageProperties properties;

    /** 공개 URL이 없으면 업로드가 모두 거절되므로 배포 직후 로그에서 바로 보이게 한다. */
    @PostConstruct
    void warnIfPublicBaseUrlMissing() {
        if (!properties.hasPublicBaseUrl()) {
            log.warn("이미지 공개 URL이 설정되지 않아 이미지 업로드가 거절됩니다. STORAGE_PUBLIC_URL 환경변수를 확인하세요.");
        }
    }

    @Bean
    public S3Client s3Client() {
        var builder = S3Client.builder()
                .region(Region.of(properties.region()))
                .credentialsProvider(DefaultCredentialsProvider.builder().build());

        if (org.springframework.util.StringUtils.hasText(properties.endpoint())) {
            builder.endpointOverride(java.net.URI.create(properties.endpoint()))
                   .forcePathStyle(true);
        }

        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        var builder = S3Presigner.builder()
                .region(Region.of(properties.region()))
                .credentialsProvider(DefaultCredentialsProvider.builder().build());

        if (org.springframework.util.StringUtils.hasText(properties.endpoint())) {
            // S3Presigner builder might not have forcePathStyle method directly in some versions,
            // but endpointOverride is required. To be safe, S3Presigner inherits the configuration.
            // Wait, S3Presigner in AWS SDK v2 does not have forcePathStyle on its builder.
            // We need to pass S3Configuration if we want to set path style.
            builder.endpointOverride(java.net.URI.create(properties.endpoint()));

            // Note: forcePathStyle for presigner requires s3Configuration
            software.amazon.awssdk.services.s3.S3Configuration s3Configuration =
                software.amazon.awssdk.services.s3.S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();
            builder.serviceConfiguration(s3Configuration);
        }

        return builder.build();
    }
}

