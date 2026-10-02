package com.begae.backend.place.exception;

import com.begae.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PlaceErrorCode implements ErrorCode {

    PLACE_NOT_FOUND(HttpStatus.NOT_FOUND, "P0001", "장소를 찾을 수 없습니다."),
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "P0004", "장소 후기를 찾을 수 없습니다."),
    RECOMMEND_NO_RESULT(HttpStatus.UNPROCESSABLE_ENTITY, "P0002", "추천할 만한 장소를 찾지 못했습니다."),
    RECOMMENDATION_SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "P0003", "추천 서비스를 잠시 이용할 수 없어요. 잠시 후 다시 시도해주세요."),
    RECOMMENDATION_INVALID_RESPONSE(HttpStatus.SERVICE_UNAVAILABLE, "P0006", "추천 결과를 확인하지 못했어요. 잠시 후 다시 시도해주세요."),
    RECOMMENDATION_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "P0005", "추천 요청이 많아요. 진행 중인 추천을 기다리거나 잠시 후 다시 시도해주세요.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
