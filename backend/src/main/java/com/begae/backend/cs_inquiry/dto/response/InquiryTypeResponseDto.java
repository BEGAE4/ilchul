package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.enums.InquiryType;

public record InquiryTypeResponseDto(String slug, String name) {
    public static InquiryTypeResponseDto from(InquiryType inquiryType) {
        return new InquiryTypeResponseDto(inquiryType.name(), inquiryType.getDescription());
    }
}

