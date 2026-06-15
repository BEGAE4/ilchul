package com.begae.backend.cs_inquiry.exception;

import com.begae.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CsInquiryErrorCode implements ErrorCode {

    INQUIRY_NOT_FOUND(HttpStatus.NOT_FOUND, "CS0001", "해당 문의를 찾을 수 없습니다."),
    UNAUTHORIZED_ACCESS(HttpStatus.FORBIDDEN, "CS0002", "해당 문의에 대한 접근 권한이 없습니다."),
    ALREADY_ANSWERED(HttpStatus.BAD_REQUEST, "CS0003", "이미 답변이 완료된 문의는 수정할 수 없습니다."),
    CANNOT_UPDATE_INQUIRY(HttpStatus.BAD_REQUEST, "CS0004", "문의를 수정할 수 있는 상태가 아닙니다."),
    INQUIRY_DELETED(HttpStatus.BAD_REQUEST, "CS0005", "삭제된 문의사항입니다.")
    ;

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
