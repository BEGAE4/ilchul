package com.begae.backend.reply.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.begae.backend.reply.domain.Reply;

import java.util.List;

public interface ReplyRepository extends JpaRepository<Reply, Integer> {

    @Query("SELECT r FROM Reply r LEFT JOIN FETCH r.user " +
           "WHERE r.plan.planId = :planId AND r.parentReplyId IS NULL " +
           "AND (r.isDeleted = false OR r.childCount > 0) " +
           "AND (:lastId IS NULL OR r.replyId < :lastId) " +
           "ORDER BY r.replyId DESC")
    List<Reply> findTopLevelReplies(@Param("planId") Integer planId, @Param("lastId") Integer lastId, Pageable pageable);

    @Query(value = "SELECT * FROM ( " +
           "  SELECT r.*, ROW_NUMBER() OVER(PARTITION BY r.parent_reply_id ORDER BY r.reply_id ASC) as rn " +
           "  FROM reply r " +
           "  WHERE r.parent_reply_id IN :parentIds AND r.is_deleted = false " +
           ") tmp WHERE tmp.rn <= 3", nativeQuery = true)
    List<Reply> findTop3ChildRepliesByParentIds(@Param("parentIds") List<Integer> parentIds);

    @Query("SELECT r FROM Reply r LEFT JOIN FETCH r.user " +
           "WHERE r.parentReplyId = :parentId " +
           "AND r.isDeleted = false " +
           "AND (:lastId IS NULL OR r.replyId > :lastId) " +
           "ORDER BY r.replyId ASC")
    List<Reply> findChildRepliesWithPaging(@Param("parentId") Integer parentId, @Param("lastId") Integer lastId, Pageable pageable);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Reply r SET r.likeCount = r.likeCount + 1 WHERE r.replyId = :replyId")
    void incrementLikeCount(@Param("replyId") Integer replyId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Reply r SET r.likeCount = r.likeCount - 1 WHERE r.replyId = :replyId AND r.likeCount > 0")
    void decrementLikeCount(@Param("replyId") Integer replyId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Reply r SET r.childCount = r.childCount + 1 WHERE r.replyId = :replyId")
    void incrementChildCount(@Param("replyId") Integer replyId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Reply r SET r.childCount = r.childCount - 1 WHERE r.replyId = :replyId AND r.childCount > 0")
    void decrementChildCount(@Param("replyId") Integer replyId);
    
}
