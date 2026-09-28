package com.begae.backend.storage.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.storage.exception.StorageErrorCode;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.CRC32;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageFileValidatorTest {

    @Test
    void 총_6천만_화소를_초과한_이미지를_거절한다() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image", "huge.png", "image/png", pngHeader(10_000, 7_000)
        );

        assertThatThrownBy(() -> ImageFileValidator.validate(image))
                .isInstanceOfSatisfying(CustomException.class, error ->
                        assertThat(error.getErrorCode()).isEqualTo(StorageErrorCode.NOT_ALLOWED_CONTENT_TYPE));
    }

    private byte[] pngHeader(int width, int height) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (DataOutputStream data = new DataOutputStream(output)) {
            data.write(new byte[]{(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a});
            ByteArrayOutputStream ihdrPayload = new ByteArrayOutputStream();
            try (DataOutputStream ihdr = new DataOutputStream(ihdrPayload)) {
                ihdr.writeInt(width);
                ihdr.writeInt(height);
                ihdr.writeByte(8);
                ihdr.writeByte(2);
                ihdr.writeByte(0);
                ihdr.writeByte(0);
                ihdr.writeByte(0);
            }
            writeChunk(data, "IHDR", ihdrPayload.toByteArray());
            writeChunk(data, "IEND", new byte[0]);
        }
        return output.toByteArray();
    }

    private void writeChunk(DataOutputStream data, String type, byte[] payload) throws Exception {
        byte[] typeBytes = type.getBytes(StandardCharsets.US_ASCII);
        data.writeInt(payload.length);
        data.write(typeBytes);
        data.write(payload);
        CRC32 crc = new CRC32();
        crc.update(typeBytes);
        crc.update(payload);
        data.writeInt((int) crc.getValue());
    }
}
