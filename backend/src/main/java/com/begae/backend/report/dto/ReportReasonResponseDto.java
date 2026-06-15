package com.begae.backend.report.dto;

import com.begae.backend.report.enums.ReportType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReportReasonResponseDto {

    private ReportType reportType;
    private List<ReasonItem> reasonItems;

    public static ReportReasonResponseDto of(ReportType reportType, List<ReasonItem> reasonItems) {
        return new ReportReasonResponseDto(reportType, reasonItems);
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReasonItem {
        private String code;
        private String label;
        private Boolean requiresContent;

        public static ReasonItem of(String code, String label, Boolean requiresContent) {
            return new ReasonItem(code, label, requiresContent);
        }
    }
}
