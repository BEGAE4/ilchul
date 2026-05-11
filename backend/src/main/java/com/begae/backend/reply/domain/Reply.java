package com.begae.backend.reply.domain;

import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.reply.dto.domain.Mention;
import com.begae.backend.reply.exception.ReplyErrorCode;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "reply")
public class Reply extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reply_id")
    private Integer replyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private Plan plan;

    @Column(name = "content")
    private String content;

    @Column(name = "parent_reply_id")
    private Integer parentReplyId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "mentions", columnDefinition = "json")
    private List<Mention> mentions;

    @Column(name = "like_count")
    private Integer likeCount;

    @Column(name = "child_count")
    private Integer childCount;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    public static Reply of(User user, Plan plan, String content, Integer parentReplyId) {
        return new Reply(user, plan, content, parentReplyId);
    }

    private Reply(User user, Plan plan, String content, Integer parentReplyId) {
        this.user = user;
        this.plan = plan;
        this.content = content;
        this.parentReplyId = parentReplyId;
        this.likeCount = 0;
        this.childCount = 0;
        this.isDeleted = false;
    }

    public void update(String content, List<User> mentionedUsers) {
        checkDeleted();
        this.content = content;
        setMentions(mentionedUsers);
    }

    public void setMentions(List<User> mentionedUsers) {
        if (mentionedUsers == null) {
            this.mentions = null;
            return;
        }
        this.mentions = mentionedUsers.stream()
            .map(u -> Mention.of(u.getUserId(), u.getUserNickname()))
            .toList();
    }

    public void incrementChildCount() {
        this.childCount++;
    }

    public void decrementChildCount() {
        if (this.childCount > 0) {
            this.childCount--;
        }
    }

    public void validateOwner(Integer requesterId) {
        checkDeleted();
        if (this.user == null || !this.user.getUserId().equals(requesterId)) {
            throw new CustomException(ReplyErrorCode.NOT_REPLY_OWNER);
        }
    }

    public void deleteReply() {
        checkDeleted();
        this.content = "삭제된 댓글입니다.";
        this.isDeleted = true;
    }

    private void checkDeleted() {
        if (Boolean.TRUE.equals(this.isDeleted)) {
            throw new CustomException(ReplyErrorCode.REPLY_ALREADY_DELETED);
        }
    }
}
