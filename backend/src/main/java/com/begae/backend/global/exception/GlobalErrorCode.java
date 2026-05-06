package com.begae.backend.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum GlobalErrorCode implements ErrorCode {

    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "G001", "잘못된 입력값입니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "G002", "허용되지 않은 HTTP 메서드입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "G003", "알 수 없는 문제가 발생했습니다. 잠시 후 다시 시도해주세요. 오류가 계속되면 관리자에게 문의해주세요."),
    ENTITY_NOT_FOUND(HttpStatus.NOT_FOUND, "G004", "엔티티를 찾을 수 없습니다."),
    HANDLE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "G005", "접근 권한이 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
