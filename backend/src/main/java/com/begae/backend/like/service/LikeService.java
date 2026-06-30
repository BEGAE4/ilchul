package com.begae.backend.like.service;

import com.begae.backend.like.dto.LikeResponseDto;

public interface LikeService {

    LikeResponseDto likePlan(Integer planId, Integer userId);
    LikeResponseDto unlikePlan(Integer planId, Integer userId);
    LikeResponseDto likePlace(Integer placeId, Integer userId);
    LikeResponseDto unlikePlace(Integer placeId, Integer userId);
}
