package com.begae.backend.report.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.report.dto.AdminReportDetailResponseDto;
import com.begae.backend.report.dto.AdminReportRequestDto;
import com.begae.backend.report.dto.AdminReportResponseDto;
import com.begae.backend.report.dto.AdminReportStatusChangeRequestDto;
import com.begae.backend.report.service.ReportAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportAdminController {

    private final ReportAdminService reportAdminService;

    /**
     * 신고 목록 조회(관리자용)
     *
     * @param adminReportRequestDto
     * @return
     */
    @GetMapping
    public ResponseEntity<AdminReportResponseDto> getReports(
//            @AuthenticationPrincipal OauthUserDetails userDetails,
            @ModelAttribute AdminReportRequestDto adminReportRequestDto
    ) {

        return ResponseEntity.ok()
                .body(reportAdminService.findReportAdmin(/*userDetails.getUserId()*/ 1, adminReportRequestDto));
    }

    /**
     * 신고 목록 상세 조회(관리자용)
     *
     * @param reportId
     * @return
     */
    @GetMapping("/{reportId}")
    public ResponseEntity<AdminReportDetailResponseDto> getReport(
//            @AuthenticationPrincipal OauthUserDetails userDetails,
            @PathVariable Integer reportId) {

        return ResponseEntity.ok()
                .body(reportAdminService.findReportDetail(reportId));
    }


    @PatchMapping("/{reportId}")
    public ResponseEntity<AdminReportDetailResponseDto> patchReportStatus(
            @AuthenticationPrincipal OauthUserDetails userDetails,
            @PathVariable Integer reportId,
            @RequestBody AdminReportStatusChangeRequestDto adminReportStatusChangeRequestDto) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(reportAdminService.changeReportStatus(userDetails.getUserId(), reportId, adminReportStatusChangeRequestDto));
    }
}
