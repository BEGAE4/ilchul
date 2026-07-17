package com.begae.backend.report.controller;

import com.begae.backend.global.aop.require_admin.RequireAdmin;
import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.report.dto.*;
import com.begae.backend.report.service.ReportAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "신고 관리(관리자)", description = "관리자용 신고 처리 API")
@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportAdminController {

    private final ReportAdminService reportAdminService;

    @RequireAdmin
    @Operation(summary = "신고 목록 조회", description = "관리자가 조건에 맞는 신고 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "신고 목록을 성공적으로 조회했습니다.")
    @GetMapping
    public ResponseEntity<AdminReportResponseDto> getReports(
            @AuthenticationPrincipal OauthUserDetails userDetails,
            @ModelAttribute AdminReportRequestDto adminReportRequestDto
    ) {

        return ResponseEntity.ok()
                .body(reportAdminService.findReportAdmin(userDetails.getUserId(), adminReportRequestDto));
    }

    @RequireAdmin
    @Operation(summary = "신고 상세 조회", description = "관리자가 특정 신고의 상세 내용을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "신고 상세 정보를 성공적으로 조회했습니다.")
    @GetMapping("/{reportId}")
    public ResponseEntity<AdminReportDetailResponseDto> getReport(
            @AuthenticationPrincipal OauthUserDetails userDetails,
            @Parameter(description = "신고 ID", example = "1") @PathVariable Integer reportId) {

        return ResponseEntity.ok()
                .body(reportAdminService.findReportDetail(reportId));
    }

    @RequireAdmin
    @Operation(summary = "신고 상태 변경", description = "관리자가 특정 신고의 처리 상태를 변경합니다.")
    @ApiResponse(responseCode = "200", description = "신고 상태가 성공적으로 변경되었습니다.")
    @PatchMapping("/{reportId}")
    public ResponseEntity<AdminReportDetailResponseDto> patchReportStatus(
            @AuthenticationPrincipal OauthUserDetails userDetails,
            @Parameter(description = "신고 ID", example = "1") @PathVariable Integer reportId,
            @RequestBody AdminReportStatusChangeRequestDto adminReportStatusChangeRequestDto) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(reportAdminService.changeReportStatus(userDetails.getUserId(), reportId, adminReportStatusChangeRequestDto));
    }

    @RequireAdmin
    @Operation(summary = "신고 제재 등록", description = "관리자가 특정 신고에 대한 제재(정지, 경고 등)를 등록합니다.")
    @ApiResponse(responseCode = "200", description = "제재가 성공적으로 등록되었습니다.")
    @PostMapping("/{reportId}/sanctions")
    public ResponseEntity<AdminReportSanctionResponseDto> postReportSanction(
            @AuthenticationPrincipal OauthUserDetails userDetails,
            @Parameter(description = "신고 ID", example = "1") @PathVariable Integer reportId,
            @Valid @RequestBody AdminReportSanctionRequestDto adminReportSanctionRequestDto
    ) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(reportAdminService.issueSanction(adminReportSanctionRequestDto, userDetails.getUserId(), reportId));
    }
}
