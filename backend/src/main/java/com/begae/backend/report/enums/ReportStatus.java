package com.begae.backend.report.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReportStatus {
    PENDING("검토 필요"),
    REVIEWING("검토 중"),
    RESOLVED("처리 완료"),
    REJECTED("반려")
    ;

    private final String description;
}
