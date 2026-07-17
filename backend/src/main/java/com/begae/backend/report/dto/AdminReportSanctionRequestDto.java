package com.begae.backend.report.dto;

import com.begae.backend.report.enums.AdminAction;
import com.begae.backend.report.enums.SanctionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportSanctionRequestDto {

    @NotNull(message = "제재 유형은 필수입니다.")
    private SanctionType type;
    private Integer durationDays;

    @NotBlank(message = "제재 메시지는 필수입니다.")
    private String message;

    @NotNull(message = "처리 결과는 필수입니다.")
    private AdminAction resolution;
}
