package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import java.util.List;

public record AdminCsInquiryListResponseDto(
        List<AdminCsInquiryItemDto> items,
        Integer nextCursorId,
        boolean hasNext,
        long totalCount
) {
    public static AdminCsInquiryListResponseDto of(List<CsInquiry> inquiries, boolean hasNext, long totalCount) {
        List<AdminCsInquiryItemDto> items = inquiries.stream()
                .map(AdminCsInquiryItemDto::from)
                .toList();
        Integer nextCursorId = inquiries.isEmpty() ? null : inquiries.get(inquiries.size() - 1).getInquiryId();
        return new AdminCsInquiryListResponseDto(items, nextCursorId, hasNext, totalCount);
    }
}
