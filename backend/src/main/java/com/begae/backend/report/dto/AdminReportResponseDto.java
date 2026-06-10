package com.begae.backend.report.dto;

import com.begae.backend.report.domain.Report;
import com.begae.backend.report.enums.ReportReason;
import com.begae.backend.report.enums.ReportStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AdminReportResponseDto {

    private List<AdminReportItem> data;
    private long totalCount;
    private int page;
    private int size;
    private boolean hasNext;

    public static AdminReportResponseDto of(Page<AdminReportItem> page) {
        return new AdminReportResponseDto(
                page.getContent(),
                page.getTotalElements(),
                page.getNumber() + 1,   // 0-based → 1-based
                page.getSize(),
                page.hasNext()
        );
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminReportItem {
        private Integer reportId;
        private ReportReason reasonCode;
        private ReportStatus status;
        private Integer reporterId;
        private String reporterNickname;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String assignedOperator;
        private Integer reportCount;
        private Boolean autoBlinded;
        private ReportTargetDto target;

        public static AdminReportItem of(Report report, ReportTargetDto target,
                                         int reportCount, boolean autoBlinded, String operator) {
            return new AdminReportItem(
                    report.getReportId(),
                    report.getReportReason(),
                    report.getReportStatus(),
                    report.getReportUser().getUserId(),
                    report.getReportUser().getUserNickname(),
                    report.getCreateAt(),
                    report.getUpdateAt(),
                    operator,
                    reportCount,
                    autoBlinded,
                    target
            );
        }
    }
}
