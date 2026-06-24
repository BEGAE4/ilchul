package com.begae.backend.report.dto;

import com.begae.backend.report.domain.Report;
import com.begae.backend.report.enums.ReportStatus;
import com.begae.backend.report.enums.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReportResponseDto {
    private Integer reportId;
    private ReportType reportType;
    private ReportStatus status;
    private Boolean alreadyReported;
    private Boolean isAutoBlinded;

    public static CreateReportResponseDto of(Report report, Boolean isBlinded) {
        return CreateReportResponseDto.builder()
                .reportId(report.getReportId())
                .reportType(report.getReportType())
                .status(report.getReportStatus())
                .alreadyReported(false)
                .isAutoBlinded(isBlinded)
                .build();
    }
}
