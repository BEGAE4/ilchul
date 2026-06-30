package com.begae.backend.place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.domain.Place;
import com.begae.backend.place.domain.PlaceReview;
import com.begae.backend.place.dto.PlaceReviewListResponseDto;
import com.begae.backend.place.dto.PlaceReviewRequestDto;
import com.begae.backend.place.dto.PlaceReviewResponseDto;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.place.repository.PlaceReviewRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaceReviewServiceImpl implements PlaceReviewService {

    private final PlaceReviewRepository placeReviewRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PlaceReviewResponseDto writeReview(Integer placeId, Integer userId, PlaceReviewRequestDto request) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        PlaceReview review = PlaceReview.of(user, place, request.getContent());
        placeReviewRepository.save(review);

        return PlaceReviewResponseDto.from(review);
    }

    @Override
    @Transactional(readOnly = true)
    public PlaceReviewListResponseDto getReviews(Integer placeId, Integer lastReviewId, int limit) {
        int safeLimit = Math.min(limit, 50);
        // limit + 1을 조회하여 다음 페이지 존재 여부를 확인합니다.
        List<PlaceReview> queryResults = placeReviewRepository.findReviewsNoOffset(
                placeId,
                lastReviewId,
                PageRequest.of(0, safeLimit + 1)
        );

        // Immutable list에서 remove하기 위해 가변 리스트로 변환
        List<PlaceReview> reviews = new ArrayList<>(queryResults);

        boolean hasNext = false;
        if (reviews.size() > safeLimit) {
            hasNext = true;
            reviews.remove(safeLimit);
        }

        List<PlaceReviewResponseDto> reviewDtos = reviews.stream()
                .map(PlaceReviewResponseDto::from)
                .toList();

        return PlaceReviewListResponseDto.of(reviewDtos, hasNext);
    }
}
