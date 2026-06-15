package com.begae.backend.report.repository;

import com.begae.backend.report.domain.Report;
import com.begae.backend.report.dto.AdminReportRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportRepositoryCustom {

    Page<Report> searchReports(AdminReportRequestDto adminReportRequestDto, Pageable pageable);
}
