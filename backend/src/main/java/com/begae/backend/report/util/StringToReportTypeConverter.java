package com.begae.backend.report.util;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.report.enums.ReportType;
import com.begae.backend.report.exception.ReportErrorCode;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class StringToReportTypeConverter implements Converter<String, ReportType> {
    @Override
    public ReportType convert(String source) {
        if (!StringUtils.hasText(source) || "all".equalsIgnoreCase(source)) {
            return null;
        }
        try {
            return ReportType.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CustomException(ReportErrorCode.REPORT_INVALID_REQUEST_DATA);
        }
    }
}
