package com.begae.backend.global.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private String timestamp;
    private String code;

    public ErrorResponse(int status, String message, String timestamp) {
        this(status, message, timestamp, null);
    }
    public static ErrorResponse of(com.begae.backend.global.exception.ErrorCode error) {
        return new ErrorResponse(error.getHttpStatus().value(), error.getMessage(), LocalDateTime.now().toString(), error.getCode());
    }

    public static ErrorResponse of(HttpStatus status, String message) {
        return new ErrorResponse(
                status.value(),
                message,
                LocalDateTime.now().toString()
        );
    }
}