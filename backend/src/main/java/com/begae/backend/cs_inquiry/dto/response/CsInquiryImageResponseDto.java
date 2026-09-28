package com.begae.backend.cs_inquiry.dto.response;

import com.begae.backend.cs_inquiry.domain.CsInquiryImage;

public record CsInquiryImageResponseDto(
        Integer imageId,
        String imageUrl
) {
    public static CsInquiryImageResponseDto from(Integer inquiryId, CsInquiryImage image) {
        return new CsInquiryImageResponseDto(
                image.getImageId(),
                "/api/cs-inquiry/" + inquiryId + "/images/" + image.getImageId()
        );
    }
}
