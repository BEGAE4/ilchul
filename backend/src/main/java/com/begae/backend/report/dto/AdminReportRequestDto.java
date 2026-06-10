package com.begae.backend.report.dto;

import com.begae.backend.report.enums.ReportReason;
import com.begae.backend.report.enums.ReportStatus;
import com.begae.backend.report.enums.ReportType;
import com.begae.backend.report.enums.SortOption;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AdminReportRequestDto {

    private ReportStatus status;
    private ReportType targetType;
    private ReportReason reasonCode;
    private String q;

    @Min(1)
    private int page = 1;

    @Min(1) @Max(100)
    private int size = 20;

    private SortOption sort = SortOption.CREATED_DESC;

    private Boolean autoBlindedOnly;
}
