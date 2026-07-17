package com.begae.backend.report.service;

import com.begae.backend.report.dto.*;

public interface ReportAdminService {

    AdminReportResponseDto findReportAdmin(Integer userId, AdminReportRequestDto adminReportRequestDto);

    AdminReportDetailResponseDto findReportDetail(Integer reportId);

    AdminReportDetailResponseDto changeReportStatus(
            Integer adminId, Integer reportId, AdminReportStatusChangeRequestDto adminReportStatusChangeRequestDto);

    AdminReportSanctionResponseDto issueSanction(
            AdminReportSanctionRequestDto adminReportSanctionRequestDto, Integer adminId, Integer reportId);
}
