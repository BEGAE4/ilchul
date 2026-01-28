package com.begae.backend.like.service;

import com.begae.backend.like.domain.Like;
import com.begae.backend.like.dto.LikeResponseDto;
import com.begae.backend.like.repository.LikeRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.user.domain.User;
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
    public LikeResponseDto toggleLike(Integer planId) {
        Integer userId = 1;
        User user = userRepository.findById(userId).orElseThrow(
                () -> new IllegalArgumentException("유저를 찾을 수 없습니다.")
        );

        Plan plan = planRepository.findById(planId).orElseThrow(
                () -> new IllegalArgumentException("플랜을 찾을 수 없습니다.")
        );

        Optional<Like> existingLike = likeRepository.findByUserAndPlan(user, plan);

        boolean isLiked;

        if (existingLike.isPresent()) {
            Like like = existingLike.get();

            if (like.isLikeStatus()) {
                like.toggleLikeStatus();
                plan.decreaseLikeCount();
                isLiked = false;
            } else {
                like.toggleLikeStatus();
                plan.increaseLikeCount();
                isLiked = true;
            }
        } else {
            Like newLike = Like.createLike(user, plan);
            likeRepository.save(newLike);
            plan.increaseLikeCount();
            isLiked = true;
        }

        return LikeResponseDto.of(isLiked, plan.getLikeCount());
    }
}
