package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import java.time.LocalDateTime;

public record UpdateCsInquiryResponseDto(
        Integer inquiryId,
        String title,
        String content,
        InquiryType inquiryType,
        InquiryStatus inquiryStatus,
        LocalDateTime updatedAt
) {
    public static UpdateCsInquiryResponseDto from(CsInquiry inquiry) {
        return new UpdateCsInquiryResponseDto(
                inquiry.getInquiryId(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getInquiryType(),
                inquiry.getInquiryStatus(),
                LocalDateTime.now()
        );
    }
}
