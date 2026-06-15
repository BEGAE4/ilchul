package com.begae.backend.cs_inquiry.dto.response;

import java.util.List;

public record InquiryTypeListResponseDto(List<InquiryTypeResponseDto> categories) {
    public static InquiryTypeListResponseDto from(List<InquiryTypeResponseDto> categories) {
        return new InquiryTypeListResponseDto(categories);
    }
}

