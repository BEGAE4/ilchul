package com.begae.backend.report.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.report.dto.CreateReportRequestDto;
import com.begae.backend.report.dto.CreateReportResponseDto;
import com.begae.backend.report.dto.ReportReasonResponseDto;
import com.begae.backend.report.enums.ReportType;
import com.begae.backend.report.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "신고", description = "신고 관련 API")
@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "신고 생성", description = "특정 대상에 대한 신고를 생성합니다.")
    @ApiResponse(responseCode = "201", description = "신고가 성공적으로 생성되었습니다.")
    @PostMapping
    public ResponseEntity<CreateReportResponseDto> postReport(
            @AuthenticationPrincipal OauthUserDetails userDetails,
            @Valid @RequestBody CreateReportRequestDto createReportRequestDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reportService.createReport(userDetails.getUserId(), createReportRequestDto));
    }

    @Operation(summary = "신고 사유 목록 조회", description = "신고 유형에 따른 신고 사유 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "신고 사유 목록을 성공적으로 조회했습니다.")
    @GetMapping("/reason")
    public ResponseEntity<ReportReasonResponseDto> getReportReason(
            @Parameter(description = "신고 유형", example = "PLAN") @RequestParam ReportType type
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(reportService.findReportReason(type));
    }
}
