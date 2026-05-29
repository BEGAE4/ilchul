package com.begae.backend.global.handler;

import com.begae.backend.global.dto.ErrorResponse;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.ErrorCode;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.place.exception.SearchLogNotExistException;
import com.begae.backend.plan.exception.PlanNotFoundException;
import com.begae.backend.user.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * 전역 예외 처리 핸들러
 *
 * 애플리케이션에서 발생하는 모든 예외를 가로채서 통일된 형태의 에러 응답으로 변환
 * @ControllerAdvice를 통해 모든 Controller에서 발생한 예외를 처리
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 커스텀 예외 처리
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex) {
        log.error("handleCustomException", ex);
        ErrorCode errorCode = ex.getErrorCode();
        return ResponseEntity.status(errorCode.getHttpStatus()).body(
                ErrorResponse.of(
                        errorCode.getHttpStatus(),
                        ex.getMessage()
                )
        );
    }

    /**
     * javax.validation.Valid 또는 @Validated 으로 binding error 발생시 발생한다.
     * HttpMessageConverter 에서 등록한 HttpMessageConverter 에 의해 binding 이 실패하며 발생한다.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.error("handleMethodArgumentNotValidException", e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.of(
                        HttpStatus.BAD_REQUEST,
                        GlobalErrorCode.INVALID_INPUT_VALUE.getMessage()
                )
        );
    }

    /**
     * @PathVariable, @RequestParam 타입 변환 실패 또는 제약 위반 시 발생한다.
     */
    @ExceptionHandler({
            MethodArgumentTypeMismatchException.class,
            ConstraintViolationException.class
    })
    protected ResponseEntity<ErrorResponse> handleBadRequestException(Exception e) {
        log.error("handleBadRequestException", e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.of(
                        HttpStatus.BAD_REQUEST,
                        GlobalErrorCode.INVALID_INPUT_VALUE.getMessage()
                )
        );
    }

    /**
     * 지원하지 않은 HTTP method 호출 할 경우 발생한다.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    protected ResponseEntity<ErrorResponse> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
        log.error("handleHttpRequestMethodNotSupportedException", e);
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(
                ErrorResponse.of(
                        HttpStatus.METHOD_NOT_ALLOWED,
                        GlobalErrorCode.METHOD_NOT_ALLOWED.getMessage()
                )
        );
    }

    /**
     * 그 외 예상치 못한 모든 예외 처리
     */
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponse> handleException(Exception e, HttpServletRequest request) {

        // 요청정보 추출
        String url = request.getRequestURI();
        String requestMethod = request.getMethod();

        log.error("예외발생 - 요청메서드 : {}, 요청url : {} | Message : {}", requestMethod, url, e.getMessage(), e);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.of(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        GlobalErrorCode.INTERNAL_SERVER_ERROR.getMessage()
                )
        );
    }

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

    @ExceptionHandler(SearchLogNotExistException.class)
    public ResponseEntity<ErrorResponse> handleSearchLogNotExist(SearchLogNotExistException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ErrorResponse.of(
                        HttpStatus.NOT_FOUND,
                        "검색기록이 존재하지 않습니다."
                )
        );
    }
}
