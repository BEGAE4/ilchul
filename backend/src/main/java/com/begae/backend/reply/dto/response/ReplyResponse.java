package com.begae.backend.reply.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.begae.backend.reply.domain.Reply;
import com.begae.backend.reply.dto.domain.Mention;
import com.begae.backend.user.domain.User;

public record ReplyResponse(
    Integer replyId, 
    Integer parentReplyId, 
    String user, 
    Integer userId, 
    String avatar/*User.userImg */, 
    String content, 
    List<Mention> mentions,
    LocalDateTime createdAt, 
    Integer likeCount, 
    boolean isLiked, 
    Integer replyCount, 
    Boolean isDeleted,
    ReplyListResponse replies
) {
    public static ReplyResponse from(Reply reply, boolean isLiked, ReplyListResponse childReplies) {
        User writer = reply.getUser();
        return new ReplyResponse(
            reply.getReplyId(),
            reply.getParentReplyId(),
            writer != null ? writer.getUserNickname() : "(알 수 없음)",
            writer != null ? writer.getUserId() : null,
            writer != null ? writer.getUserImg() : null,
            reply.getContent(),
            reply.getMentions(),
            reply.getCreateAt(),
            reply.getLikeCount(),
            isLiked,
            reply.getChildCount(),
            reply.getIsDeleted(),
            childReplies
        );
    }
}
