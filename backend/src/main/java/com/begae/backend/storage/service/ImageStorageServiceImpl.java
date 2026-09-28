package com.begae.backend.storage.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.storage.config.S3StorageProperties;
import com.begae.backend.storage.dto.StoredImage;
import com.begae.backend.storage.exception.StorageErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageStorageServiceImpl implements ImageStorageService {

    private final S3Client s3Client;
//    private final S3Presigner s3Presigner;
    private final S3StorageProperties properties;

    @Override
    public StoredImage upload(MultipartFile file, String directory) {
        return upload(file, directory, true);
    }

    @Override
    public StoredImage uploadPrivate(MultipartFile file, String directory) {
        return upload(file, directory, false);
    }

    private StoredImage upload(MultipartFile file, String directory, boolean includePublicUrl) {
        validateImageFile(file);
        if (includePublicUrl) {
            // 공개 URL을 만들 수 없는 상태에서 S3에 먼저 올리면 깨진 URL이 저장되므로 업로드 전에 확인한다.
            properties.normalizedPublicBaseUrl();
        }

        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        String extension = extractExtension(originalFilename);
        String imageKey = createImageKey(directory, extension);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(properties.bucket())
                .key(imageKey)
                .contentType(contentType)
                .contentLength(file.getSize())
                .build();

        try {
            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
        } catch (Exception e) {
            throw new CustomException(StorageErrorCode.FAILED_FILE_READ);
        }

        String imageUrl = includePublicUrl ? getAccessibleUrl(imageKey) : null;

        return new StoredImage(
                imageKey,
                imageUrl,
                originalFilename,
                contentType,
                file.getSize()
        );
    }

    @Override
    public StoredImage uploadByUrl(byte[] bytes, String originalFilename, String contentType, String directory) {
        validateImageBytes(bytes, contentType);
        properties.normalizedPublicBaseUrl();

        String extension = extractExtension(originalFilename);
        String imageKey = createImageKey(directory, extension);

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(properties.bucket())
                    .key(imageKey)
                    .contentType(contentType)
                    .contentLength((long) bytes.length)
                    .build();

            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromBytes(bytes)
            );

            String imageUrl = getAccessibleUrl(imageKey);

            return new StoredImage(
                    imageKey,
                    imageUrl,
                    originalFilename,
                    contentType,
                    (long) bytes.length
            );
        } catch (Exception e) {
            throw new IllegalStateException("이미지 업로드에 실패했습니다.", e);
        }
    }




    @Override
    public void delete(String imageKey) {
        if (!StringUtils.hasText(imageKey)) {
            return;
        }

        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(properties.bucket())
                .key(imageKey)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }

    @Override
    public String getAccessibleUrl(String imageKey) {
        if (!StringUtils.hasText(imageKey)) {
            throw new CustomException(StorageErrorCode.EMPTY_KEY);
        }

        String normalizedImageKey = imageKey.replaceAll("^/+", "");

        return properties.normalizedPublicBaseUrl() + "/" + normalizedImageKey;

    }

    @Override
    public byte[] download(String imageKey) {
        if (!StringUtils.hasText(imageKey)) {
            throw new CustomException(StorageErrorCode.EMPTY_KEY);
        }

        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(properties.bucket())
                .key(imageKey)
                .build();
        try {
            return s3Client.getObjectAsBytes(request).asByteArray();
        } catch (RuntimeException e) {
            throw new CustomException(StorageErrorCode.FAILED_FILE_READ);
        }
    }

    private void validateImageFile(MultipartFile file) {
        ImageFileValidator.validate(file);
    }

    private void validateImageBytes(byte[] bytes, String contentType) {
        ImageFileValidator.validate(bytes, contentType);
    }


    private String extractExtension(String originalFilename) {
        if (!StringUtils.hasText(originalFilename) || !originalFilename.contains(".")) {
            return "jpg";
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1)
                .toLowerCase();

        return switch (extension) {
            case "jpg", "jpeg", "png", "webp" -> extension;
            default -> throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
        };
    }

    private String extractExtensionFromContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다.");
        };
    }


    private String createImageKey(String directory, String extension) {
        String normalizedDirectory = directory
                .replace("\\", "/")
                .replaceAll("^/+", "")
                .replaceAll("/+$", "");

        return normalizedDirectory + "/" + UUID.randomUUID() + "." + extension;
    }

}
