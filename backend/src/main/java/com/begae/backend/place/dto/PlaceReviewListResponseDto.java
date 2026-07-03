package com.begae.backend.place.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class PlaceReviewListResponseDto {
    private final int status;
    private final String message;
    private final List<PlaceReviewResponseDto> data;
    private final boolean hasNext;

    public static PlaceReviewListResponseDto of(List<PlaceReviewResponseDto> data, boolean hasNext) {
        return PlaceReviewListResponseDto.builder()
                .status(200)
                .message("성공")
                .data(data)
                .hasNext(hasNext)
                .build();
    }
}
