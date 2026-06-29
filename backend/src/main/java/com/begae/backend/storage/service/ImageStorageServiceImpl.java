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
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageStorageServiceImpl implements ImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final S3Client s3Client;
//    private final S3Presigner s3Presigner;
    private final S3StorageProperties properties;

    @Override
    public StoredImage upload(MultipartFile file, String directory) {
        validateImageFile(file);

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

        String imageUrl = getAccessibleUrl(imageKey);

        return new StoredImage(
                imageKey,
                imageUrl,
                originalFilename,
                contentType,
                file.getSize()
        );
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

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(StorageErrorCode.EMPTY_FILE);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new CustomException(StorageErrorCode.TOO_LARGE_FILE_SIZE);
        }

        String contentType = file.getContentType();

        if (!StringUtils.hasText(contentType) || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
        }
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

    private String createImageKey(String directory, String extension) {
        String normalizedDirectory = directory
                .replace("\\", "/")
                .replaceAll("^/+", "")
                .replaceAll("/+$", "");

        return normalizedDirectory + "/" + UUID.randomUUID() + "." + extension;
    }

}
