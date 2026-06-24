package com.begae.backend.report.exception;

import com.begae.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ReportErrorCode implements ErrorCode {

    REPORT_NOT_FOUND(HttpStatus.NOT_FOUND, "RT001", "신고를 찾을 수 없습니다."),
    REPORT_INVALID_REQUEST_DATA(HttpStatus.BAD_REQUEST, "RT002", "잘못된 요청 데이터가 있습니다."),
    REPORT_NOT_REASON(HttpStatus.BAD_REQUEST, "RT003", "신고 사유가 잘못되었습니다."),
    SELF_REPORT_FORBIDDEN(HttpStatus.FORBIDDEN, "RT004", "자기 자신을 신고할 수 없습니다."),
    SHORT_TERM_MASS_REPORT(HttpStatus.TOO_MANY_REQUESTS, "RT005", "짧은시간동안 여러번 신고할 수 없습니다."),
    DUPLICATE_REPORT(HttpStatus.OK, "RT006", "동일한 신고 내역이 있습니다.")
    ;

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
