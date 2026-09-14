package com.begae.backend.storage.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(OutputCaptureExtension.class)
class S3StorageConfigTest {

    @Test
    void 공개_URL이_없으면_시작할_때_경고를_남긴다(CapturedOutput output) {
        new S3StorageConfig(new S3StorageProperties("http://minio:9000", "ilchul", "ap-northeast-1", ""))
                .warnIfPublicBaseUrlMissing();

        assertThat(output).contains("STORAGE_PUBLIC_URL");
    }

    @Test
    void 공개_URL이_있으면_경고하지_않는다(CapturedOutput output) {
        new S3StorageConfig(new S3StorageProperties("http://minio:9000", "ilchul", "ap-northeast-1", "https://s3.example.com/ilchul"))
                .warnIfPublicBaseUrlMissing();

        assertThat(output).doesNotContain("STORAGE_PUBLIC_URL");
    }
}
