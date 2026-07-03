package com.begae.backend.like.service;

import com.begae.backend.like.domain.Like;
import com.begae.backend.like.dto.LikeResponseDto;
import com.begae.backend.like.enums.LikeType;
import com.begae.backend.like.repository.LikeRepository;
import com.begae.backend.place.domain.Place;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.repository.UserRepository;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.user.exception.UserErrorCode;
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
    private final PlaceRepository placeRepository;

    @Transactional
    @Override
    public LikeResponseDto likePlan(Integer planId, Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new CustomException(UserErrorCode.USER_NOT_FOUND)
        );

        Plan plan = planRepository.findByIdWithLock(planId).orElseThrow(
                () -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND)
        );

        Optional<Like> existingLike = likeRepository
                .findByUser_UserIdAndTypeIdAndLikeType(userId, plan.getPlanId(), LikeType.PLAN);

        boolean isLiked = true;

        if (existingLike.isPresent()) {
            Like like = existingLike.get();
            if (!like.getLikeStatus()) {
                like.toggleLikeStatus();
                plan.increaseLikeCount();
            }
        } else {
            Like newLike = Like.createPlanLike(user, plan);
            likeRepository.save(newLike);
            plan.increaseLikeCount();
        }

        return LikeResponseDto.of(isLiked, plan.getLikeCount());
    }

    @Transactional
    @Override
    public LikeResponseDto unlikePlan(Integer planId, Integer userId) {
        Plan plan = planRepository.findByIdWithLock(planId).orElseThrow(
                () -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND)
        );

        Optional<Like> existingLike = likeRepository
                .findByUser_UserIdAndTypeIdAndLikeType(userId, plan.getPlanId(), LikeType.PLAN);

        boolean isLiked = false;

        if (existingLike.isPresent()) {
            Like like = existingLike.get();
            if (like.getLikeStatus()) {
                like.toggleLikeStatus();
                plan.decreaseLikeCount();
            }
        }

        return LikeResponseDto.of(isLiked, plan.getLikeCount());
    }

    @Transactional
    @Override
    public LikeResponseDto likePlace(Integer placeId, Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new CustomException(UserErrorCode.USER_NOT_FOUND)
        );

        Place place = placeRepository.findByIdWithLock(placeId).orElseThrow(
                () -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND)
        );

        Optional<Like> existingLike = likeRepository
                .findByUser_UserIdAndTypeIdAndLikeType(userId, place.getPlaceId(), LikeType.PLACE);

        boolean isLiked = true;

        if (existingLike.isPresent()) {
            Like like = existingLike.get();
            if (!like.getLikeStatus()) {
                like.toggleLikeStatus();
                place.increaseLikeCount();
            }
        } else {
            Like newLike = Like.createPlaceLike(user, place);
            likeRepository.save(newLike);
            place.increaseLikeCount();
        }

        return LikeResponseDto.of(isLiked, place.getLikeCount());
    }

    @Transactional
    @Override
    public LikeResponseDto unlikePlace(Integer placeId, Integer userId) {
        Place place = placeRepository.findByIdWithLock(placeId).orElseThrow(
                () -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND)
        );

        Optional<Like> existingLike = likeRepository
                .findByUser_UserIdAndTypeIdAndLikeType(userId, place.getPlaceId(), LikeType.PLACE);

        boolean isLiked = false;

        if (existingLike.isPresent()) {
            Like like = existingLike.get();
            if (like.getLikeStatus()) {
                like.toggleLikeStatus();
                place.decreaseLikeCount();
            }
        }

        return LikeResponseDto.of(isLiked, place.getLikeCount());
    }
}
