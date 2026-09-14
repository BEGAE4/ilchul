package com.begae.backend.storage.service;

import com.begae.backend.storage.dto.StoredImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URISyntaxException;
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
        Optional<URI> downloadUri = resolveDownloadUri(imageUrl);
        if (downloadUri.isEmpty()) {
            return Optional.empty();
        }

        try {
            URI uri = downloadUri.get();

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

    /**
     * 카카오는 프로필 주소를 http 로 주지만 같은 이미지를 https 로도 제공하므로 https 로 받는다.
     */
    static Optional<URI> resolveDownloadUri(String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            return Optional.empty();
        }

        try {
            URI uri = new URI(imageUrl.trim());
            if (uri.getHost() == null) {
                return Optional.empty();
            }
            if ("https".equalsIgnoreCase(uri.getScheme())) {
                return Optional.of(uri);
            }
            if ("http".equalsIgnoreCase(uri.getScheme())) {
                return Optional.of(new URI("https", uri.getRawAuthority(), uri.getRawPath(), uri.getRawQuery(), null));
            }
        } catch (URISyntaxException e) {
            return Optional.empty();
        }
        return Optional.empty();
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
