package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import java.time.LocalDateTime;

public record UserCsInquiryItemDto(
        Integer inquiryId,
        String title,
        InquiryType inquiryType,
        InquiryStatus inquiryStatus,
        boolean hasAnswer,
        LocalDateTime createdAt
) {
    public static UserCsInquiryItemDto from(CsInquiry inquiry) {
        boolean hasAnswer = inquiry.getAnswer() != null;
        return new UserCsInquiryItemDto(
                inquiry.getInquiryId(),
                inquiry.getTitle(),
                inquiry.getInquiryType(),
                inquiry.getInquiryStatus(),
                hasAnswer,
                inquiry.getCreateAt()
        );
    }
}
