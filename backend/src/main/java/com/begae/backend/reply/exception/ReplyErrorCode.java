package com.begae.backend.reply.exception;

import org.springframework.http.HttpStatus;

import com.begae.backend.global.exception.ErrorCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReplyErrorCode implements ErrorCode {

    REPLY_NOT_FOUND(HttpStatus.BAD_REQUEST, "R0001", "댓글을 찾을 수 없습니다."),
    CANNOT_REPLY_TO_RE_REPLY(HttpStatus.BAD_REQUEST, "R0002", "대댓글에는 답글을 작성할 수 없습니다."),
    CANNOT_REPLY_TO_OTHER_PLAN(HttpStatus.BAD_REQUEST, "R0003", "다른 플랜의 댓글에는 답글을 작성할 수 없습니다."),
    ALREADY_LIKE_TO_REPLY(HttpStatus.BAD_REQUEST, "R0004", "이미 좋아요를 눌렀습니다."),
    CANNOT_CANCEL_LIKE_TO_REPLY(HttpStatus.BAD_REQUEST, "R0005", "좋아요를 취소할 수 없습니다. 좋아요를 누른 적이 없습니다."),
    NOT_REPLY_OWNER(HttpStatus.FORBIDDEN, "R0006", "댓글 수정/삭제 권한이 없습니다."),
    REPLY_ALREADY_DELETED(HttpStatus.BAD_REQUEST, "R0007", "이미 삭제된 댓글입니다."),
    ;
    
    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
