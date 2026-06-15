package com.begae.backend.report.dto;

import com.begae.backend.report.enums.ReportReason;
import com.begae.backend.report.enums.ReportType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CreateReportRequestDto {
    @NotNull(message = "신고 유형은 필수입니다.")
    private ReportType targetType;
    @NotNull(message = "신고 대상 ID는 필수입니다.")
    private Integer targetId;
    @NotNull(message = "신고 사유는 필수입니다.")
    private ReportReason reasonCode;
    private String detail;
}
