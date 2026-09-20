package com.begae.backend.storage.service;

import com.begae.backend.storage.config.S3StorageProperties;
import com.begae.backend.storage.dto.StoredImage;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.storage.exception.StorageErrorCode;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ImageStorageServiceImplTest {

    private final S3Client s3Client = mock(S3Client.class);

    @Test
    void 공개_base_URL이_미치환이면_S3에_올리기_전에_업로드를_거절한다() throws Exception {
        ImageStorageServiceImpl service = new ImageStorageServiceImpl(
                s3Client,
                new S3StorageProperties(null, "bucket", "ap-northeast-2", "${STORAGE_PUBLIC_URL}")
        );
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", bytes);
        MockMultipartFile file = new MockMultipartFile("image", "a.png", "image/png", bytes.toByteArray());

        assertThatThrownBy(() -> service.upload(file, "plan/1/image"))
                .isInstanceOf(IllegalStateException.class);
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void 비공개_업로드는_공개_base_URL_없이_key와_메타데이터만_반환한다() throws Exception {
        ImageStorageServiceImpl service = new ImageStorageServiceImpl(
                s3Client,
                new S3StorageProperties(null, "bucket", "ap-northeast-2", "${STORAGE_PUBLIC_URL}")
        );
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", bytes);
        MockMultipartFile file = new MockMultipartFile("image", "a.png", "image/png", bytes.toByteArray());

        StoredImage stored = service.uploadPrivate(file, "cs-inquiry/7/images");

        assertThat(stored.imageKey()).startsWith("cs-inquiry/7/images/").endsWith(".png");
        assertThat(stored.imageUrl()).isNull();
        assertThat(stored.originalFilename()).isEqualTo("a.png");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void 실제_이미지인_10MB_파일은_업로드를_허용한다() throws Exception {
        ImageStorageServiceImpl service = configuredService();
        MultipartFile file = imageFileWithReportedSize(10L * 1024 * 1024);

        assertThatCode(() -> service.upload(file, "plan/1/image"))
                .doesNotThrowAnyException();

        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void 이미지_content_type을_위조한_파일은_업로드하지_않는다() {
        ImageStorageServiceImpl service = configuredService();
        MockMultipartFile file = new MockMultipartFile(
                "image", "fake.png", "image/png", "not-an-image".getBytes()
        );

        assertThatThrownBy(() -> service.upload(file, "plan/1/image"))
                .isInstanceOfSatisfying(CustomException.class, error ->
                        org.assertj.core.api.Assertions.assertThat(error.getErrorCode())
                                .isEqualTo(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE));

        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void 한_변이_12000px을_초과한_이미지는_업로드하지_않는다() throws Exception {
        ImageStorageServiceImpl service = configuredService();
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(12_001, 1, BufferedImage.TYPE_INT_RGB), "png", bytes);
        MockMultipartFile file = new MockMultipartFile(
                "image", "wide.png", "image/png", bytes.toByteArray()
        );

        assertThatThrownBy(() -> service.upload(file, "plan/1/image"))
                .isInstanceOfSatisfying(CustomException.class, error ->
                        org.assertj.core.api.Assertions.assertThat(error.getErrorCode())
                                .isEqualTo(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE));

        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void 비공개_이미지_key로_객체_바이트를_읽는다() {
        byte[] bytes = new byte[]{1, 2, 3};
        when(s3Client.getObjectAsBytes(any(GetObjectRequest.class)))
                .thenReturn(ResponseBytes.fromByteArray(GetObjectResponse.builder().build(), bytes));

        assertThat(configuredService().download("cs-inquiry/7/images/a.png"))
                .containsExactly(bytes);

        verify(s3Client).getObjectAsBytes(any(GetObjectRequest.class));
    }

    private ImageStorageServiceImpl configuredService() {
        return new ImageStorageServiceImpl(
                s3Client,
                new S3StorageProperties(null, "bucket", "ap-northeast-2", "https://storage.example.com/bucket")
        );
    }

    private MultipartFile imageFileWithReportedSize(long reportedSize) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", bytes);
        byte[] imageBytes = bytes.toByteArray();

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(reportedSize);
        when(file.getOriginalFilename()).thenReturn("large.png");
        when(file.getContentType()).thenReturn("image/png");
        when(file.getInputStream()).thenAnswer(ignored -> new ByteArrayInputStream(imageBytes));
        return file;
    }
}
