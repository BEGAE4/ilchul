package com.begae.backend.reply.dto.request;

import java.util.List;

public record CreateReplyRequestDto(String content, Integer parentReplyId, List<Integer> mentions) {
    
}
