package com.begae.backend.report.dto;

import com.begae.backend.report.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportStatusChangeRequestDto {
    private ReportStatus status;
    private String note;
}
