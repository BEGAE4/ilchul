package com.begae.backend.reply.service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.reply.domain.LikeReply;
import com.begae.backend.reply.domain.Reply;
import com.begae.backend.reply.dto.request.CreateReplyRequestDto;
import com.begae.backend.reply.dto.request.PatchReplyRequestDto;
import com.begae.backend.reply.dto.response.ReplyListResponse;
import com.begae.backend.reply.dto.response.ReplyResponse;
import com.begae.backend.reply.exception.ReplyErrorCode;
import com.begae.backend.reply.repository.LikeReplyRepository;
import com.begae.backend.reply.repository.ReplyRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReplyService {
    
    private final ReplyRepository replyRepository;
    private final LikeReplyRepository likeReplyRepository;
    private final PlanRepository planRepository;
    private final UserRepository userRepository;

    @Transactional
    public Integer createReply(Integer userId, Integer planId, CreateReplyRequestDto replyRequestDto) {
        Plan plan = readPlan(planId);
        User user = readUser(userId);

        String content = replyRequestDto.content();
        Integer parentReplyId = replyRequestDto.parentReplyId();

        if (parentReplyId != null) {
            Reply parentReply = readReply(parentReplyId);
            
            if (parentReply.getParentReplyId() != null) {
                throw new CustomException(ReplyErrorCode.CANNOT_REPLY_TO_RE_REPLY);
            }
            
            if (!parentReply.getPlan().getPlanId().equals(planId)) {
                throw new CustomException(ReplyErrorCode.CANNOT_REPLY_TO_OTHER_PLAN);
            }
        }

        Reply newReply = Reply.of(user, plan, content, parentReplyId);
        
        // 멘션 처리 - 엔티티 내부로 통합
        if (replyRequestDto.mentions() != null && !replyRequestDto.mentions().isEmpty()) {
            List<User> mentionedUsers = userRepository.findAllById(replyRequestDto.mentions());
            newReply.setMentions(mentionedUsers);
        }

        Reply savedReply = replyRepository.save(newReply);

        // 부모 댓글의 대댓글 수 증가
        if (parentReplyId != null) {
            replyRepository.incrementChildCount(parentReplyId);
        }

        return savedReply.getReplyId();
    }

    @Transactional
    public Integer patchReply(Integer userId, Integer replyId, PatchReplyRequestDto requestDto) {
        Reply reply = readReply(replyId);
        reply.validateOwner(userId);

        List<User> mentionedUsers = null;
        if (requestDto.mentions() != null) {
            mentionedUsers = userRepository.findAllById(requestDto.mentions());
        }

        reply.update(requestDto.content(), mentionedUsers);

        return reply.getReplyId();
    }

    @Transactional
    public Integer deleteReply(Integer userId, Integer replyId) {
        Reply reply = readReply(replyId);
        reply.validateOwner(userId);

        reply.deleteReply();
        
        // 부모 댓글이 있다면 대댓글 수 감소
        if (reply.getParentReplyId() != null) {
            replyRepository.decrementChildCount(reply.getParentReplyId());
        }

        return reply.getReplyId();
    }

    @Transactional(readOnly = true)
    public ReplyListResponse getRepliesOfPlan(Integer currentUserId, Integer planId, int size, Integer lastReplyId) {
        Pageable pageable = PageRequest.of(0, size + 1);
        List<Reply> topReplies = replyRepository.findTopLevelReplies(planId, lastReplyId, pageable);

        boolean hasNext = topReplies.size() > size;
        if (hasNext) {
            topReplies = topReplies.subList(0, size);
        }

        // 2. 대댓글 상위 3개만 일괄 조회 (Native Query로 DB 레벨 최적화)
        List<Integer> parentIds = topReplies.stream().map(Reply::getReplyId).toList();
        List<Reply> allChildren = parentIds.isEmpty() ? List.of() : replyRepository.findTop3ChildRepliesByParentIds(parentIds);

        // 3. 좋아요 여부 일괄 확인
        Set<Integer> likedReplyIds = getLikedReplyIds(currentUserId, Stream.concat(topReplies.stream(), allChildren.stream()).toList());

        // 대댓글을 부모별로 그룹화
        Map<Integer, List<ReplyResponse>> childrenMap = allChildren.stream()
            .map(child -> ReplyResponse.from(child, likedReplyIds.contains(child.getReplyId()), null))
            .collect(Collectors.groupingBy(ReplyResponse::parentReplyId));

        List<ReplyResponse> responses = topReplies.stream()
            .map(parent -> {
                List<ReplyResponse> children = childrenMap.getOrDefault(parent.getReplyId(), List.of());
                return ReplyResponse.from(parent, 
                                          likedReplyIds.contains(parent.getReplyId()), 
                                          ReplyListResponse.of(children, false));
            }).toList();

        return ReplyListResponse.of(responses, hasNext);
    }

    /**
     * 특정 댓글의 대댓글만 페이징하여 조회
     */
    @Transactional(readOnly = true)
    public ReplyListResponse getChildReplies(Integer currentUserId, Integer parentId, int size, Integer lastReplyId) {
        Pageable pageable = PageRequest.of(0, size + 1);
        List<Reply> children = replyRepository.findChildRepliesWithPaging(parentId, lastReplyId, pageable);

        boolean hasNext = children.size() > size;
        if (hasNext) {
            children = children.subList(0, size);
        }

        Set<Integer> likedReplyIds = getLikedReplyIds(currentUserId, children);

        List<ReplyResponse> responses = children.stream()
            .map(child -> ReplyResponse.from(child, likedReplyIds.contains(child.getReplyId()), null))
            .toList();

        return ReplyListResponse.of(responses, hasNext);
    }

    @Transactional
    public Integer likeReply(Integer userId, Integer replyId) {
        readReply(replyId);
        readUser(userId);

        if (likeReplyRepository.findByUserIdAndReplyId(userId, replyId) != null) {
            throw new CustomException(ReplyErrorCode.ALREADY_LIKE_TO_REPLY);
        }

        LikeReply newLikeReply = LikeReply.of(userId, replyId);
        likeReplyRepository.save(newLikeReply);
        replyRepository.incrementLikeCount(replyId);

        // 업데이트된 값 반환을 위해 다시 조회
        return readReply(replyId).getLikeCount();
    }

    @Transactional
    public Integer cancelLikeReply(Integer userId, Integer replyId) {
        readReply(replyId);
        readUser(userId);

        LikeReply likeReply = likeReplyRepository.findByUserIdAndReplyId(userId, replyId);

        if (likeReply == null) {
            throw new CustomException(ReplyErrorCode.CANNOT_CANCEL_LIKE_TO_REPLY);
        }

        likeReplyRepository.delete(likeReply);
        replyRepository.decrementLikeCount(replyId);

        return readReply(replyId).getLikeCount();
    }

    // ---------------- 내부 메서드 ---------------------

    private Set<Integer> getLikedReplyIds(Integer currentUserId, List<Reply> replies) {
        if (currentUserId == null || replies.isEmpty()) {
            return Collections.emptySet();
        }
        List<Integer> replyIds = replies.stream().map(Reply::getReplyId).toList();
        return likeReplyRepository.findByUserIdAndReplyIdIn(currentUserId, replyIds)
                .stream()
                .map(LikeReply::getReplyId)
                .collect(Collectors.toSet());
    }

    private User readUser(Integer userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
    }

    private Reply readReply(Integer replyId) {
        return replyRepository.findById(replyId)
            .orElseThrow(() -> new CustomException(ReplyErrorCode.REPLY_NOT_FOUND));
    }

    private Plan readPlan(Integer planId) {
        return planRepository.findById(planId)
            .orElseThrow(() -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND));
    }

}
