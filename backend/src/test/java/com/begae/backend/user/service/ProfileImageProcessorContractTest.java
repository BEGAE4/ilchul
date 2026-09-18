package com.begae.backend.user.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.storage.exception.StorageErrorCode;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProfileImageProcessorContractTest {

    @Test
    void 긴_변이_512px을_넘는_프로필_사진을_비율대로_축소한다() throws Exception {
        BufferedImage source = new BufferedImage(1024, 256, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = source.createGraphics();
        graphics.setColor(Color.BLUE);
        graphics.fillRect(0, 0, source.getWidth(), source.getHeight());
        graphics.dispose();
        ByteArrayOutputStream original = new ByteArrayOutputStream();
        ImageIO.write(source, "png", original);

        Class<?> processorType = Class.forName("com.begae.backend.user.service.ProfileImageProcessor");
        Object processor = processorType.getConstructor().newInstance();
        Method process = processorType.getMethod("process", org.springframework.web.multipart.MultipartFile.class);
        Object processed = process.invoke(processor, new MockMultipartFile(
                "image", "profile.png", "image/png", original.toByteArray()
        ));
        byte[] bytes = (byte[]) processed.getClass().getMethod("bytes").invoke(processed);
        BufferedImage resized = ImageIO.read(new ByteArrayInputStream(bytes));

        assertThat(resized.getWidth()).isEqualTo(512);
        assertThat(resized.getHeight()).isEqualTo(128);
    }

    @Test
    void 용량이_5MB를_초과한_프로필_사진은_413_오류로_거절한다() {
        ProfileImageProcessor processor = new ProfileImageProcessor();
        MockMultipartFile oversized = new MockMultipartFile(
                "image",
                "profile.png",
                "image/png",
                new byte[5 * 1024 * 1024 + 1]
        );

        assertThatThrownBy(() -> processor.process(oversized))
                .isInstanceOfSatisfying(CustomException.class, error ->
                        assertThat(error.getErrorCode()).isEqualTo(StorageErrorCode.TOO_LARGE_FILE_SIZE));
    }

    @Test
    void 허용하지_않은_형식의_프로필_사진은_400_오류로_거절한다() {
        ProfileImageProcessor processor = new ProfileImageProcessor();
        MockMultipartFile gif = new MockMultipartFile(
                "image", "profile.gif", "image/gif", new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> processor.process(gif))
                .isInstanceOfSatisfying(CustomException.class, error ->
                        assertThat(error.getErrorCode()).isEqualTo(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE));
    }
}
