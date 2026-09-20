package com.begae.backend.storage.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.storage.exception.StorageErrorCode;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public final class ImageFileValidator {

    static final long MAX_FILE_SIZE = 15L * 1024 * 1024;
    static final int MAX_DIMENSION = 12_000;
    static final long MAX_PIXEL_COUNT = 60_000_000L;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final Map<String, Set<String>> CONTENT_TYPE_FORMATS = Map.of(
            "image/jpeg", Set.of("jpeg", "jpg"),
            "image/png", Set.of("png"),
            "image/webp", Set.of("webp")
    );

    private ImageFileValidator() {
    }

    public static void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(StorageErrorCode.EMPTY_FILE);
        }
        validateSize(file.getSize());
        validateContentType(file.getContentType());
        try {
            validateImage(file.getInputStream(), file.getContentType());
        } catch (IOException e) {
            throw new CustomException(StorageErrorCode.FAILED_FILE_READ);
        }
    }

    public static void validate(byte[] bytes, String contentType) {
        if (bytes == null || bytes.length == 0) {
            throw new CustomException(StorageErrorCode.EMPTY_FILE);
        }
        validateSize(bytes.length);
        validateContentType(contentType);
        validateImage(new ByteArrayInputStream(bytes), contentType);
    }

    private static void validateSize(long size) {
        if (size > MAX_FILE_SIZE) {
            throw new CustomException(StorageErrorCode.TOO_LARGE_FILE_SIZE);
        }
    }

    private static void validateContentType(String contentType) {
        if (!StringUtils.hasText(contentType) || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
        }
    }

    private static void validateImage(InputStream inputStream, String contentType) {
        try (InputStream source = inputStream;
             ImageInputStream imageInput = ImageIO.createImageInputStream(source)) {
            if (imageInput == null) {
                throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
            }

            Iterator<ImageReader> readers = ImageIO.getImageReaders(imageInput);
            if (!readers.hasNext()) {
                throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(imageInput, true, true);
                String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                if (!CONTENT_TYPE_FORMATS.get(contentType).contains(format)) {
                    throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
                }
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width > MAX_DIMENSION
                        || height > MAX_DIMENSION
                        || (long) width * height > MAX_PIXEL_COUNT) {
                    throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
                }
            } finally {
                reader.dispose();
            }
        } catch (CustomException e) {
            throw e;
        } catch (IOException | RuntimeException e) {
            throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
        }
    }
}
