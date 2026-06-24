package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import java.time.LocalDateTime;

public record AdminCsInquiryItemDto(
        Integer inquiryId,
        String title,
        InquiryType inquiryType,
        InquiryStatus inquiryStatus,
        boolean hasAnswer,
        String authorNickname,
        LocalDateTime createdAt
) {
    public static AdminCsInquiryItemDto from(CsInquiry inquiry) {
        boolean hasAnswer = inquiry.getAnswer() != null;
        return new AdminCsInquiryItemDto(
                inquiry.getInquiryId(),
                inquiry.getTitle(),
                inquiry.getInquiryType(),
                inquiry.getInquiryStatus(),
                hasAnswer,
                inquiry.getUser().getUserNickname(),
                inquiry.getCreateAt()
        );
    }
}
