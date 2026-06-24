package com.begae.backend.storage.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(S3StorageProperties.class)
public class S3StorageConfig {

    private final S3StorageProperties properties;

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

