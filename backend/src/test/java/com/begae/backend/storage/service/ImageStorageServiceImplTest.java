package com.begae.backend.storage.service;

import com.begae.backend.storage.config.S3StorageProperties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class ImageStorageServiceImplTest {

    private final S3Client s3Client = mock(S3Client.class);

    @Test
    void 공개_base_URL이_미치환이면_S3에_올리기_전에_업로드를_거절한다() {
        ImageStorageServiceImpl service = new ImageStorageServiceImpl(
                s3Client,
                new S3StorageProperties(null, "bucket", "ap-northeast-2", "${STORAGE_PUBLIC_URL}")
        );
        MockMultipartFile file = new MockMultipartFile("image", "a.png", "image/png", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> service.upload(file, "plan/1/image"))
                .isInstanceOf(IllegalStateException.class);
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }
}
