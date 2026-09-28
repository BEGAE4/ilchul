package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;

import java.time.LocalDateTime;
import java.util.List;

public record CsInquiryDetailResponseDto(
        Integer inquiryId,
        String title,
        String content,
        InquiryType inquiryType,
        InquiryStatus inquiryStatus,
        List<CsInquiryImageResponseDto> images,
        String authorNickname,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        ReplyCsInquiryResponseDto answer
) {
    public static CsInquiryDetailResponseDto from(CsInquiry inquiry) {
        List<CsInquiryImageResponseDto> images = inquiry.getImages().stream()
                .map(image -> CsInquiryImageResponseDto.from(inquiry.getInquiryId(), image))
                .toList();
        ReplyCsInquiryResponseDto answer = inquiry.getAnswer() == null
                ? null
                : ReplyCsInquiryResponseDto.from(inquiry);
        return new CsInquiryDetailResponseDto(
                inquiry.getInquiryId(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getInquiryType(),
                inquiry.getInquiryStatus(),
                images,
                inquiry.getUser().getUserNickname(),
                inquiry.getCreateAt(),
                inquiry.getLastUpdateAt(),
                answer
        );
    }
}
