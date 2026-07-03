package com.begae.backend.place.service;

import com.begae.backend.place.dto.PlaceReviewListResponseDto;
import com.begae.backend.place.dto.PlaceReviewRequestDto;
import com.begae.backend.place.dto.PlaceReviewResponseDto;

public interface PlaceReviewService {
    PlaceReviewResponseDto writeReview(Integer placeId, Integer userId, PlaceReviewRequestDto request);
    PlaceReviewListResponseDto getReviews(Integer placeId, Integer lastReviewId, int limit);
}
