package com.begae.backend.report.service;

import com.begae.backend.report.dto.AdminReportDetailResponseDto;
import com.begae.backend.report.dto.AdminReportRequestDto;
import com.begae.backend.report.dto.AdminReportResponseDto;
import com.begae.backend.report.dto.AdminReportStatusChangeRequestDto;

public interface ReportAdminService {

    AdminReportResponseDto findReportAdmin(Integer userId, AdminReportRequestDto adminReportRequestDto);

    AdminReportDetailResponseDto findReportDetail(Integer reportId);

    AdminReportDetailResponseDto changeReportStatus(
            Integer adminId,
            Integer reportId,
            AdminReportStatusChangeRequestDto adminReportStatusChangeRequestDto);
}
