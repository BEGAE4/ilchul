package com.begae.backend.cs_inquiry.dto.request;

import com.begae.backend.cs_inquiry.enums.InquiryType;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateCsInquiryRequestDto(
        @NotBlank String content,
        InquiryType inquiryType,
        List<MultipartFile> images
) {
}


