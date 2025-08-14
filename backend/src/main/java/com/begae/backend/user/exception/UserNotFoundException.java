package com.begae.backend.user.exception;

public class UserNotFoundException extends RuntimeException{
    public UserNotFoundException() {
        throw new RuntimeException("해당 유저를 찾을 수 없습니다.");
    }
}
