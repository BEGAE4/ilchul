package com.begae.backend.cs_inquiry.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CsInquiryServiceContractTest {

    @Test
    void 문의_상세와_첨부_파일을_인증된_사용자_권한으로_조회하는_계약을_제공한다() throws Exception {
        assertThat(CsInquiryService.class.getMethod(
                "getCsInquiryDetail", Integer.class, boolean.class, Integer.class
        )).isNotNull();
        assertThat(CsInquiryService.class.getMethod(
                "getCsInquiryImage", Integer.class, boolean.class, Integer.class, Integer.class
        )).isNotNull();
    }
}
