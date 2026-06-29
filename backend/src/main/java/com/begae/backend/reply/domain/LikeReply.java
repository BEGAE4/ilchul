package com.begae.backend.reply.domain;

import com.begae.backend.global.domain.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "like_reply")
public class LikeReply extends BaseEntity {
    
    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_reply_id")
    private Integer likeReplyId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "reply_id")
    private Integer replyId;

    public static LikeReply of(Integer userId, Integer replyId) {
        return new LikeReply(userId, replyId);
    }

    private LikeReply(Integer userId, Integer replyId) {
        this.userId = userId;
        this.replyId = replyId;
    } 
}
