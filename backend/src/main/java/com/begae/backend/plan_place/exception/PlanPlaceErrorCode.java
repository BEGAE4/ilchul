package com.begae.backend.plan_place.exception;

import com.begae.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PlanPlaceErrorCode implements ErrorCode {

    PLAN_PLACE_NOT_FOUND(HttpStatus.NOT_FOUND, "PP001", "플랜에서 해당 장소를 찾을 수 없습니다."),
    EMPTY_PLAN_PLACE(HttpStatus.BAD_REQUEST, "PP002", "플랜의 장소는 비어있을 수 없습니다."),
    INVALID_ORDER_STATE(HttpStatus.BAD_REQUEST,"PP003", "장소의 순서가 올바르지 않습니다."),
    INVALID_PLAN_PLACE(HttpStatus.BAD_REQUEST, "PP004", "플랜의 장소 목록이 올바르지 않습니다."),
    OUT_OF_STAMP_RANGE(HttpStatus.UNPROCESSABLE_ENTITY, "PP005", "현재 장소가 인증 범위 밖에 있습니다."),
    ALREADY_VERIFIED(HttpStatus.CONFLICT, "PP006", "이미 인증된 장소입니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
