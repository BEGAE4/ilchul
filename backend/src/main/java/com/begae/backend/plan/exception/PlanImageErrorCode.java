package com.begae.backend.plan.exception;

import com.begae.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PlanImageErrorCode implements ErrorCode {

    PLAN_IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "PI001", "해당 이미지를 찾을 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
