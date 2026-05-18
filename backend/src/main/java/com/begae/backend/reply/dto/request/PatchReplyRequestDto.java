package com.begae.backend.reply.dto.request;

import java.util.List;

public record PatchReplyRequestDto(String content, List<Integer> mentions) {

}
