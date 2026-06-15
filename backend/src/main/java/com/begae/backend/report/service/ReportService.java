package com.begae.backend.report.service;

import com.begae.backend.report.dto.CreateReportRequestDto;
import com.begae.backend.report.dto.CreateReportResponseDto;
import com.begae.backend.report.dto.ReportReasonResponseDto;
import com.begae.backend.report.enums.ReportType;

public interface ReportService {
    CreateReportResponseDto createReport(Integer reporterUserId, CreateReportRequestDto createReportRequestDto);
    ReportReasonResponseDto findReportReason(ReportType type);
}
