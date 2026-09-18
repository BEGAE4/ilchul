package com.begae.backend.user.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.storage.exception.StorageErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

@Component
public class ProfileImageProcessor {

    private static final int MAX_DIMENSION = 512;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Map<String, String> OUTPUT_FORMATS = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "png"
    );

    public ProcessedProfileImage process(MultipartFile image) {
        validate(image);
        try {
            BufferedImage source = ImageIO.read(image.getInputStream());
            if (source == null) {
                throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
            }

            double scale = Math.min(1.0, (double) MAX_DIMENSION / Math.max(source.getWidth(), source.getHeight()));
            int width = Math.max(1, (int) Math.round(source.getWidth() * scale));
            int height = Math.max(1, (int) Math.round(source.getHeight() * scale));
            String format = OUTPUT_FORMATS.get(image.getContentType());
            BufferedImage resized = resize(source, width, height, "jpg".equals(format));
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            if (!ImageIO.write(resized, format, output)) {
                throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
            }

            String contentType = "jpg".equals(format) ? "image/jpeg" : "image/png";
            return new ProcessedProfileImage(
                    output.toByteArray(),
                    baseName(image.getOriginalFilename()) + "." + format,
                    contentType
            );
        } catch (CustomException e) {
            throw e;
        } catch (IOException e) {
            throw new CustomException(StorageErrorCode.FAILED_FILE_READ);
        }
    }

    private BufferedImage resize(BufferedImage source, int width, int height, boolean jpeg) {
        BufferedImage target = new BufferedImage(
                width,
                height,
                jpeg ? BufferedImage.TYPE_INT_RGB : BufferedImage.TYPE_INT_ARGB
        );
        Graphics2D graphics = target.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        graphics.drawImage(source, 0, 0, width, height, null);
        graphics.dispose();
        return target;
    }

    private void validate(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new CustomException(StorageErrorCode.EMPTY_FILE);
        }
        if (image.getSize() > MAX_FILE_SIZE) {
            throw new CustomException(StorageErrorCode.TOO_LARGE_FILE_SIZE);
        }
        if (!StringUtils.hasText(image.getContentType()) || !OUTPUT_FORMATS.containsKey(image.getContentType())) {
            throw new CustomException(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE);
        }
    }

    private String baseName(String filename) {
        if (!StringUtils.hasText(filename)) {
            return "profile";
        }
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(0, dot) : filename;
    }
}
