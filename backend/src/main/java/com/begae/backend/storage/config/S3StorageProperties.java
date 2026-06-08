package com.begae.backend.storage.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cloud.aws.s3")
public record S3StorageProperties(String bucket,
                                  String region,
                                  Integer presignedUrlDurationMinutes) {

}
