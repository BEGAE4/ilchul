package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import java.time.LocalDateTime;

public record CreateCsInquiryResponseDto(
        Integer inquiryId,
        String title,
        InquiryType inquiryType,
        InquiryStatus inquiryStatus,
        LocalDateTime createdAt
) {
    public static CreateCsInquiryResponseDto from(CsInquiry inquiry) {
        return new CreateCsInquiryResponseDto(
                inquiry.getInquiryId(),
                inquiry.getTitle(),
                inquiry.getInquiryType(),
                inquiry.getInquiryStatus(),
                inquiry.getCreateAt()
        );
    }
}
