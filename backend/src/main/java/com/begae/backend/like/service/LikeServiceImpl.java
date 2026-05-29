package com.begae.backend.like.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.like.domain.Like;
import com.begae.backend.like.dto.LikeResponseDto;
import com.begae.backend.like.enums.LikeType;
import com.begae.backend.like.repository.LikeRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final PlanRepository planRepository;

    @Transactional
    @Override
    public LikeResponseDto toggleLike(Integer planId, Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new CustomException(UserErrorCode.USER_NOT_FOUND)
        );

        Plan plan = planRepository.findById(planId).orElseThrow(
                () -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND)
        );

        Optional<Like> existingLike = likeRepository
                .findByUser_UserIdAndTypeIdAndLikeType(userId, plan.getPlanId(), LikeType.PLAN);

        boolean isLiked;

        if (existingLike.isPresent()) {
            Like like = existingLike.get();

            if (like.getLikeStatus()) {
                like.toggleLikeStatus();
                plan.decreaseLikeCount();
                isLiked = false;
            } else {
                like.toggleLikeStatus();
                plan.increaseLikeCount();
                isLiked = true;
            }
        } else {
            Like newLike = Like.createPlanLike(user, plan);
            likeRepository.save(newLike);
            plan.increaseLikeCount();
            isLiked = true;
        }

        return LikeResponseDto.of(isLiked, plan.getLikeCount());
    }
}
