package com.begae.backend.storage.service;

import com.begae.backend.storage.dto.StoredImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SocialProfileImageStorageService {

    private static final long MAX_DOWNLOAD_SIZE = 5 * 1024 * 1024;

    private final ImageStorageService imageStorageService;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    public Optional<StoredImage> uploadFromUrl(String imageUrl, String directory) {
        if (!StringUtils.hasText(imageUrl)) {
            return Optional.empty();
        }

        try {
            URI uri = URI.create(imageUrl);

            if (!"https".equalsIgnoreCase(uri.getScheme())) {
                return Optional.empty();
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .GET()
                    .build();

            HttpResponse<byte[]> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofByteArray()
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return Optional.empty();
            }

            String contentType = response.headers()
                    .firstValue("Content-Type")
                    .map(value -> value.split(";")[0].trim())
                    .orElse(null);

            if (!isAllowedContentType(contentType)) {
                return Optional.empty();
            }

            byte[] imageBytes = response.body();

            if (imageBytes == null || imageBytes.length == 0) {
                return Optional.empty();
            }

            if (imageBytes.length > MAX_DOWNLOAD_SIZE) {
                return Optional.empty();
            }

            String originalFilename = createOriginalFilename(uri, contentType);

            StoredImage storedImage = imageStorageService.uploadByUrl(
                    imageBytes,
                    originalFilename,
                    contentType,
                    directory
            );

            return Optional.of(storedImage);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private boolean isAllowedContentType(String contentType) {
        return "image/jpeg".equals(contentType)
                || "image/png".equals(contentType)
                || "image/webp".equals(contentType);
    }

    private String createOriginalFilename(URI uri, String contentType) {
        String path = uri.getPath();

        if (StringUtils.hasText(path)) {
            int slashIndex = path.lastIndexOf("/");
            String filename = slashIndex >= 0 ? path.substring(slashIndex + 1) : path;

            if (StringUtils.hasText(filename) && filename.contains(".")) {
                return filename;
            }
        }

        return switch (contentType) {
            case "image/png" -> "social-profile.png";
            case "image/webp" -> "social-profile.webp";
            default -> "social-profile.jpg";
        };
    }
}
