package com.begae.backend.reply.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.begae.backend.reply.dto.request.CreateReplyRequestDto;
import com.begae.backend.reply.dto.request.PatchReplyRequestDto;
import com.begae.backend.reply.dto.response.ReplyListResponse;
import com.begae.backend.reply.service.ReplyService;
import com.begae.backend.global.security.principal.OauthUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "댓글", description = "플랜 댓글 작성, 수정, 삭제, 조회 및 좋아요 관련 API")
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
    @Operation(summary = "댓글 작성", description = "플랜에 새로운 댓글을 작성합니다.")
    @ApiResponse(responseCode = "201", description = "댓글이 성공적으로 작성되었습니다. (생성된 댓글 ID 반환)")
    public ResponseEntity<Integer> writeReply(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "플랜 ID", example = "1") @PathVariable Integer planId,
            @RequestBody CreateReplyRequestDto request
        ) {
        Integer savedReplyId = replyService.createReply(user.getUserId(), planId, request);
        return ResponseEntity.status(201).body(savedReplyId);
    }

    /**
     * 댓글 수정 API
     * @param user
     * @param replyId
     * @return
     */
    @PatchMapping("/{replyId}")
    @Operation(summary = "댓글 수정", description = "작성한 댓글의 내용을 수정합니다.")
    @ApiResponse(responseCode = "200", description = "댓글이 성공적으로 수정되었습니다. (수정된 댓글 ID 반환)")
    public ResponseEntity<Integer> updateReply(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "수정할 댓글 ID", example = "1") @PathVariable Integer replyId,
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
    @Operation(summary = "댓글 삭제", description = "작성한 댓글을 삭제합니다.")
    @ApiResponse(responseCode = "200", description = "댓글이 성공적으로 삭제되었습니다. (삭제된 댓글 ID 반환)")
    public ResponseEntity<Integer> deleteReply(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "삭제할 댓글 ID", example = "1") @PathVariable Integer replyId
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
    @Operation(summary = "플랜의 댓글 목록 조회", description = "특정 플랜에 작성된 댓글 목록을 페이징하여 조회합니다. (비로그인 사용자도 조회 가능)")
    @ApiResponse(responseCode = "200", description = "댓글 목록이 성공적으로 조회되었습니다.")
    public ResponseEntity<ReplyListResponse> getReplies(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "플랜 ID", example = "1") @PathVariable Integer planId,
            @Parameter(description = "페이지 크기", example = "10") @RequestParam(name = "size", required = false, defaultValue = "10") int size,
            @Parameter(description = "마지막으로 조회된 댓글 ID (커서 페이징용)", example = "100") @RequestParam(name = "lastReplyId", required = false) Integer lastReplyId
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
    @Operation(summary = "대댓글 목록 조회", description = "특정 부모 댓글의 대댓글(답글) 목록을 페이징하여 조회합니다. (비로그인 사용자도 조회 가능)")
    @ApiResponse(responseCode = "200", description = "대댓글 목록이 성공적으로 조회되었습니다.")
    public ResponseEntity<ReplyListResponse> getChildReplies(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "부모 댓글 ID", example = "1") @PathVariable Integer parentReplyId,
            @Parameter(description = "페이지 크기", example = "10") @RequestParam(name = "size", required = false, defaultValue = "10") int size,
            @Parameter(description = "마지막으로 조회된 대댓글 ID (커서 페이징용)", example = "100") @RequestParam(name = "lastReplyId", required = false) Integer lastReplyId
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
    @Operation(summary = "댓글 좋아요", description = "특정 댓글에 좋아요를 등록합니다.")
    @ApiResponse(responseCode = "200", description = "좋아요가 성공적으로 등록되었습니다.")
    public ResponseEntity<Integer> likeReply(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "좋아요할 댓글 ID", example = "1") @PathVariable Integer replyId
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
    @Operation(summary = "댓글 좋아요 취소", description = "특정 댓글에 등록한 좋아요를 취소합니다.")
    @ApiResponse(responseCode = "200", description = "좋아요가 성공적으로 취소되었습니다.")
    public ResponseEntity<Integer> unlikeReply(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "좋아요를 취소할 댓글 ID", example = "1") @PathVariable Integer replyId
        ) {
        return ResponseEntity.ok(replyService.cancelLikeReply(user.getUserId(), replyId));
    }
}
