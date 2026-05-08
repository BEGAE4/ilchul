package com.begae.backend.plan.exception;

import com.begae.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PlanErrorCode implements ErrorCode {

    PLAN_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "플랜을 찾을 수 없습니다."),
    INVALID_PLAN_STATUS(HttpStatus.BAD_REQUEST, "P002", "유효하지 않은 플랜 상태입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
