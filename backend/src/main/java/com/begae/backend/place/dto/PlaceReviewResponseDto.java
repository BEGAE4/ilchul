package com.begae.backend.place.dto;

import com.begae.backend.place.domain.PlaceReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class PlaceReviewResponseDto {
    private final Integer reviewId;
    private final Integer userId;
    private final String userNickname;
    private final String userImg;
    private final String content;
    private final LocalDateTime createAt;

    public static PlaceReviewResponseDto from(PlaceReview review) {
        return PlaceReviewResponseDto.builder()
                .reviewId(review.getReviewId())
                .userId(review.getUser() != null ? review.getUser().getUserId() : null)
                .userNickname(review.getUser() != null ? review.getUser().getUserNickname() : null)
                .userImg(review.getUser() != null ? review.getUser().getUserImg() : null)
                .content(review.getContent())
                .createAt(review.getCreateAt())
                .build();
    }
}
