package com.begae.backend.cs_inquiry.dto.response;

import java.util.List;

public record CsInquiryListResponseDto(
        List<CsInquiryResponseDto> inquiries,
        boolean hasNext
) {

    public static CsInquiryListResponseDto of(List<CsInquiryResponseDto> inquiries, boolean hasNext) {
        return new CsInquiryListResponseDto(inquiries, hasNext);
    }
}

