package com.begae.backend.cs_inquiry.dto.response;

public record CsInquiryImageContent(
        byte[] bytes,
        String contentType,
        String originalFilename
) {
}
