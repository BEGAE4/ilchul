package com.begae.backend.place.exception;

import com.begae.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PlaceErrorCode implements ErrorCode {

    PLACE_NOT_FOUND(HttpStatus.BAD_REQUEST, "P0001", "장소를 찾을 수 없습니다."),
    RECOMMEND_NO_RESULT(HttpStatus.UNPROCESSABLE_ENTITY, "P0002", "추천할 만한 장소를 찾지 못했습니다."),
    RECOMMENDATION_SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "P0003", "추천 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
