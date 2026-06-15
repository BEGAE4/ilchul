package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import java.time.LocalDateTime;

public record ReplyCsInquiryResponseDto(
        Integer answerId,
        Integer inquiryId,
        String content,
        String answeredBy,
        LocalDateTime answeredAt
) {
    public static ReplyCsInquiryResponseDto from(CsInquiry inquiry) {
        return new ReplyCsInquiryResponseDto(
                inquiry.getInquiryId(), // using inquiryId as answerId since they are 1:1
                inquiry.getInquiryId(),
                inquiry.getAnswer(),
                "관리자",
                inquiry.getAnsweredAt()
        );
    }
}
