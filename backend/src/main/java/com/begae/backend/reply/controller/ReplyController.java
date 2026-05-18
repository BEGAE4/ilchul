package com.begae.backend.reply.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.begae.backend.reply.dto.request.CreateReplyRequestDto;
import com.begae.backend.reply.dto.request.PatchReplyRequestDto;
import com.begae.backend.reply.dto.response.ReplyListResponse;
import com.begae.backend.reply.service.ReplyService;
import com.begae.backend.user.auth.OauthUserDetails;

import io.micrometer.core.ipc.http.HttpSender.Response;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reply")
public class ReplyController {

    private final ReplyService replyService;

    /**
     * 댓글 작성 API
     * @param user
     * @param planId
     * @return
     */
    @PostMapping("/{planId}")
    public ResponseEntity<Integer> writeReply(
            @AuthenticationPrincipal OauthUserDetails user,
            @PathVariable Integer planId,
            @RequestBody CreateReplyRequestDto request
        ) {
        Integer savedReplyId = replyService.createReply(user.getUserId(), planId, request);
        return ResponseEntity.ok(savedReplyId);
    }

    /**
     * 댓글 수정 API
     * @param user
     * @param replyId
     * @return
     */
    @PatchMapping("/{replyId}")
    public ResponseEntity<Integer> updateReply(
            @AuthenticationPrincipal OauthUserDetails user,
            @PathVariable Integer replyId,
            @RequestBody PatchReplyRequestDto request
        ) {
        return ResponseEntity.ok(replyService.patchReply(user.getUserId(), replyId, request));
    }

    /**
     * 댓글 삭제 API
     * @param user
     * @param replyId
     * @return
     */
    @DeleteMapping("/{replyId}")
    public ResponseEntity<Integer> deleteReply(
            @AuthenticationPrincipal OauthUserDetails user,
            @PathVariable Integer replyId
        ) {
        return ResponseEntity.ok(replyService.deleteReply(user.getUserId(), replyId));
    }

    /**
     * 플랜의 댓글들을 조회하는 API
     * @param planId
     * @param lastReplyId
     * @return
     */
    @GetMapping("/{planId}")
    public ResponseEntity<ReplyListResponse> getReplies(
            @AuthenticationPrincipal OauthUserDetails user,
            @PathVariable Integer planId,
            @RequestParam(name = "size", required = false, defaultValue = "10") int size,
            @RequestParam(name = "lastReplyId", required = false) Integer lastReplyId
        ) {
        return ResponseEntity.ok(replyService.getRepliesOfPlan(user != null ? user.getUserId() : null, planId, size, lastReplyId));
    }

    /**
     * 특정 댓글의 대댓글들을 페이징하여 조회하는 API
     * @param user
     * @param parentReplyId
     * @param size
     * @param lastReplyId
     * @return
     */
    @GetMapping("/{parentReplyId}/children")
    public ResponseEntity<ReplyListResponse> getChildReplies(
            @AuthenticationPrincipal OauthUserDetails user,
            @PathVariable Integer parentReplyId,
            @RequestParam(name = "size", required = false, defaultValue = "10") int size,
            @RequestParam(name = "lastReplyId", required = false) Integer lastReplyId
        ) {
        return ResponseEntity.ok(replyService.getChildReplies(user != null ? user.getUserId() : null, parentReplyId, size, lastReplyId));
    }

    /**
     * 댓글 좋아요 API
     * @param user
     * @param replyId
     * @return
     */
    @PostMapping("/like/{replyId}")
    public ResponseEntity<Integer> likeReply(
            @AuthenticationPrincipal OauthUserDetails user,
            @PathVariable Integer replyId
        ) {
        return ResponseEntity.ok(replyService.likeReply(user.getUserId(), replyId));
    }

    /**
     * 댓글 좋아요 취소 API
     * @param user
     * @param replyId
     * @return
     */
    @DeleteMapping("/like/{replyId}")
    public ResponseEntity<Integer> unlikeReply(
            @AuthenticationPrincipal OauthUserDetails user,
            @PathVariable Integer replyId
        ) {
        return ResponseEntity.ok(replyService.cancelLikeReply(user.getUserId(), replyId));
    }
}
