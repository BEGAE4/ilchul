package com.begae.backend.reply.dto.domain;

public record Mention(Integer userId, String userNickname) {
    
    public static Mention of(Integer userId, String userNickname) {
        return new Mention(userId, userNickname);
    }
}
