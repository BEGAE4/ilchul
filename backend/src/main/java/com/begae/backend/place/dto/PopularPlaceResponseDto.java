package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PopularPlaceResponseDto {

    private final int status;
    private final String message;
    private final List<PopularPlaceItemDto> data;
    private final int page;
    private final int limit;
    private final boolean hasNext;
    private final int totalCount;

    public static PopularPlaceResponseDto of(List<PopularPlaceItemDto> data, int page, int limit, int totalCount) {
        return PopularPlaceResponseDto.builder()
                .status(200)
                .message("성공")
                .data(data)
                .page(page)
                .limit(limit)
                .hasNext((long) page * limit < totalCount)
                .totalCount(totalCount)
                .build();
    }
}
