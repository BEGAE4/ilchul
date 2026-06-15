package com.begae.backend.reply.dto.response;

import java.util.List;

public record ReplyListResponse(
    List<ReplyResponse> replies, 
    boolean hasNext
) {
    public static ReplyListResponse of(List<ReplyResponse> replies, boolean hasNext) {
        return new ReplyListResponse(replies, hasNext);
    }
}
