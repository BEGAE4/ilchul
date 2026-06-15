package com.begae.backend.report.enums;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.report.exception.ReportErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;

import java.util.Arrays;

@Getter
@RequiredArgsConstructor
public enum SortOption {
    CREATED_DESC   ("createdAt:desc", Sort.by(Sort.Direction.DESC, "createAt")),
    CREATED_ASC    ("createdAt:asc",  Sort.by(Sort.Direction.ASC,  "createAt")),
    REPORT_COUNT_DESC("reportCount:desc", null);   // 집계 정렬은 쿼리에서 별도 처리

    private final String code;
    private final Sort sort;

    public static SortOption from(String value) {
        if (value == null) return CREATED_DESC;
        return Arrays.stream(values())
                .filter(o -> o.code.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new CustomException(ReportErrorCode.REPORT_INVALID_REQUEST_DATA));
    }
}