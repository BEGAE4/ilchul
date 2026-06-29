package com.begae.backend.plan.exception;

import com.begae.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PlanErrorCode implements ErrorCode {

    PLAN_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "플랜을 찾을 수 없습니다."),
    INVALID_PLAN_STATUS(HttpStatus.BAD_REQUEST, "P002", "유효하지 않은 플랜 상태입니다."),
    PLAN_ACCESS_DENIED(HttpStatus.FORBIDDEN,"P003", "플랜 수정 권한이 없습니다."),
    VERIFIED_PLAN_UPDATE_RESTRICTED(HttpStatus.CONFLICT, "P004", "인증된 플랜은 해당 정보를 수정할 수 없습니다."),
    INVALID_TRIP_DATE_RANGE(HttpStatus.BAD_REQUEST, "P005", "여행 시작일은 여행 종료일보다 늦을 수 없습니다."),
    NOT_COPY_MINE(HttpStatus.CONFLICT, "P006", "본인 플랜은 복사할 수 없습니다."),
    PLAN_BLINDED(HttpStatus.FORBIDDEN, "P007", "블라인드된 플랜입니다.")
    ;

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
