package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import java.util.List;

public record UserCsInquiryListResponseDto(
        List<UserCsInquiryItemDto> items,
        Integer nextCursorId,
        boolean hasNext
) {
    public static UserCsInquiryListResponseDto of(List<CsInquiry> inquiries, boolean hasNext) {
        List<UserCsInquiryItemDto> items = inquiries.stream()
                .map(UserCsInquiryItemDto::from)
                .toList();
        Integer nextCursorId = inquiries.isEmpty() ? null : inquiries.get(inquiries.size() - 1).getInquiryId();
        return new UserCsInquiryListResponseDto(items, nextCursorId, hasNext);
    }
}
