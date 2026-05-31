package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;

import java.time.LocalDateTime;

public record CsInquiryResponseDto(
        Integer inquiryId,
        Integer userId,
        String userNickname,
        String content,
        InquiryType inquiryType,
        InquiryStatus inquiryStatus,
        String answer,
        LocalDateTime answeredAt,
        LocalDateTime createAt,
        LocalDateTime closedAt
) {
    public static CsInquiryResponseDto from(CsInquiry inquiry) {
        return new CsInquiryResponseDto(
                inquiry.getInquiryId(),
                inquiry.getUser().getUserId(),
                inquiry.getUser().getUserNickname(),
                inquiry.getContent(),
                inquiry.getInquiryType(),
                inquiry.getInquiryStatus(),
                inquiry.getAnswer(),
                inquiry.getAnsweredAt(),
                inquiry.getCreateAt(),
                inquiry.getClosedAt()
        );
    }
}

