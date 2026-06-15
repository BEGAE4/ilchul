package com.begae.backend.cs_inquiry.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ReplyCsInquiryRequestDto(
        @NotBlank String content
) {
}
