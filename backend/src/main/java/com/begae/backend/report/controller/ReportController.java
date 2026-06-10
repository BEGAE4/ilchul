package com.begae.backend.report.controller;

import com.begae.backend.report.dto.CreateReportRequestDto;
import com.begae.backend.report.dto.CreateReportResponseDto;
import com.begae.backend.report.dto.ReportReasonResponseDto;
import com.begae.backend.report.enums.ReportType;
import com.begae.backend.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * 신고 생성 API
     * @param createReportRequestDto
     * @return
     */
    @PostMapping
    public ResponseEntity<CreateReportResponseDto> postReport(
            //@AuthenticationPrincipal OauthUserDetails userDetails,
            @Valid @RequestBody CreateReportRequestDto createReportRequestDto
    ) {
        Integer userId = 4;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reportService.createReport(userId, createReportRequestDto));
    }

    /**
     * 신고 목록 이유 조회 API
     * @param type
     * @return
     */
    @GetMapping("/reason")
    public ResponseEntity<ReportReasonResponseDto> getReportReason(
            @RequestParam ReportType type
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(reportService.findReportReason(type));
    }
}
