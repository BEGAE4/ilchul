package com.begae.backend.cs_inquiry.domain;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class CsInquiryImageContractTest {

    @Test
    void 문의_첨부는_공개_URL_대신_객체_key와_파일_메타데이터를_저장한다() {
        Set<String> fields = Set.of(CsInquiryImage.class.getDeclaredFields()).stream()
                .map(java.lang.reflect.Field::getName)
                .collect(java.util.stream.Collectors.toSet());

        assertThat(fields).contains("imageKey", "originalFilename", "contentType", "fileSize");
    }
}
