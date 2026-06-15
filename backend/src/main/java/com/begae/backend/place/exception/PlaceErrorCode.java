package com.begae.backend.place.exception;

import com.begae.backend.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PlaceErrorCode implements ErrorCode {

    PLACE_NOT_FOUND(HttpStatus.BAD_REQUEST, "P0001", "장소를 찾을 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
