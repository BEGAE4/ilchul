package com.begae.backend.report.dto;

import com.begae.backend.report.domain.AdminLog;
import com.begae.backend.report.domain.Report;
import com.begae.backend.report.enums.AdminAction;
import com.begae.backend.report.enums.ReportReason;
import com.begae.backend.report.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportDetailResponseDto {

    private Integer reportId;
    private AdminAction resolution;
    private ReportReason reasonCode;
    private ReportStatus status;
    private Integer reporterId;
    private String reporterNickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer assignedOperator;
    private Integer reportCount;
    private Boolean autoBlinded;
    private String detail;
    private ReportTargetDto target;
    private List<History> histories;
    private List<RelatedReport> relatedReports;

    public static AdminReportDetailResponseDto of(
            Report report, ReportTargetDto target, Boolean autoBlinded, Integer reportCount,
            List<History> histories, List<RelatedReport> relatedReports) {

        AdminAction resolution = report.getAdminLogs().isEmpty()
                ? null
                : report.getAdminLogs().get(report.getAdminLogs().size() - 1).getAction();

        return AdminReportDetailResponseDto.builder()
                .reportId(report.getReportId())
                .resolution(resolution)
                .reasonCode(report.getReportReason())
                .status(report.getReportStatus())
                .reporterId(report.getReportUser().getUserId())
                .reporterNickname(report.getReportUser().getUserNickname())
                .createdAt(report.getCreateAt())
                .updatedAt(report.getUpdateAt())
                .reportCount(reportCount)
                .autoBlinded(autoBlinded)
                .detail(report.getContent())
                .target(target)
                .histories(histories)
                .relatedReports(relatedReports)
                .build();
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class History {
        private ReportStatus status;
        private LocalDateTime at;
        private String actor;
        private String note;

        public static History of(AdminLog adminLog) {
            return History.builder()
                    .status(adminLog.getReport().getReportStatus())
                    .at(adminLog.getProcessedAt())
                    .actor(adminLog.getAdmin().getUserNickname())
                    .note(adminLog.getNote())
                    .build();
        }
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelatedReport {
        private Integer reportId;
        private ReportReason reasonCode;
        private String reporterNickname;
        private LocalDateTime createdAt;

        public static RelatedReport of(Report report) {
            return RelatedReport.builder()
                    .reportId(report.getReportId())
                    .reasonCode(report.getReportReason())
                    .reporterNickname(report.getReportUser().getUserNickname())
                    .createdAt(report.getCreateAt())
                    .build();
        }
    }
}
