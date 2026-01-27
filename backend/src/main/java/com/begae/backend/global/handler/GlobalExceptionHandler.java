package com.begae.backend.global.handler;

import com.begae.backend.global.dto.ErrorResponse;
import com.begae.backend.plan.exception.PlanNotFoundException;
import com.begae.backend.user.exception.UserNotFoundException;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * 전역 예외 처리 핸들러
 *
 * 애플리케이션에서 발생하는 모든 예외를 가로채서 통일된 형태의 에러 응답으로 변환
 * @ControllerAdvice를 통해 모든 Controller에서 발생한 예외를 처리
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 사용자를 찾을 수 없을 때 발생하는 예외 처리
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ErrorResponse.of(
                        HttpStatus.NOT_FOUND,
                        "회원을 찾을 수 없습니다."
                )
        );
    }

    @ExceptionHandler(PlanNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePlanNotFound(PlanNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ErrorResponse.of(
                        HttpStatus.NOT_FOUND,
                        "플랜을 찾을 수 없습니다."
                )
        );
    }

//    @ExceptionHandler(LikeNotFoundException.class)
//    public ResponseEntity<ErrorResponse> handleLikeNotFound(LikeNotFoundException ex) {
//        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
//                ErrorResponse.of(
//                        HttpStatus.NOT_FOUND,
//                        "좋아요를 찾을 수 없습니다."
//                )
//        );
//    }
}
