package com.begae.backend.storage.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ImageStorageServiceContractTest {

    @Test
    void 비공개_이미지를_백엔드가_읽을_수_있는_계약을_제공한다() throws Exception {
        assertThat(ImageStorageService.class.getMethod("download", String.class).getReturnType())
                .isEqualTo(byte[].class);
    }
}
