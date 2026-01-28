package com.begae.backend.like.dto;

import jakarta.annotation.Nonnull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikeResponseDto {
    private Boolean isLiked;
    private Integer likeCount;

    public static LikeResponseDto of(Boolean isLiked, Integer likeCount) {
        return new LikeResponseDto(isLiked, likeCount);
    }
}