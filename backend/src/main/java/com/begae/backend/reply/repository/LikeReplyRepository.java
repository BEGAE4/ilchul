package com.begae.backend.reply.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.begae.backend.reply.domain.LikeReply;

public interface LikeReplyRepository extends JpaRepository<LikeReply, Integer> {

    LikeReply findByUserIdAndReplyId(Integer userId, Integer replyId);

    List<LikeReply> findByUserIdAndReplyIdIn(Integer userId, List<Integer> replyIds);
    
}
