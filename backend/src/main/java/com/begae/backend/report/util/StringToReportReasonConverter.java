package com.begae.backend.report.util;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.report.enums.ReportReason;
import com.begae.backend.report.exception.ReportErrorCode;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class StringToReportReasonConverter implements Converter<String, ReportReason> {
    @Override
    public ReportReason convert(String source) {
        if (!StringUtils.hasText(source) || "all".equalsIgnoreCase(source)) {
            return null;
        }
        try {
            return ReportReason.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CustomException(ReportErrorCode.REPORT_INVALID_REQUEST_DATA);
        }
    }
}
