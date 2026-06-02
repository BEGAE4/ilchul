package com.begae.backend.storage.exception;

import com.begae.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum StorageErrorCode implements ErrorCode {
    EMPTY_FILE(HttpStatus.BAD_REQUEST, "S001", "비어있는 파일입니다."),
    TOO_LARGE_FILE_SIZE(HttpStatus.BAD_REQUEST, "S002", "파일의 크기는 5MB를 초과할 수 없습니다."),
    NOT_ALLOWED_CONTENT_TYPE(HttpStatus.BAD_REQUEST,"S003", "지원하지 않는 파일 형식입니다."),
    FAILED_FILE_READ(HttpStatus.INTERNAL_SERVER_ERROR, "S004", "파일을 읽는 중 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
