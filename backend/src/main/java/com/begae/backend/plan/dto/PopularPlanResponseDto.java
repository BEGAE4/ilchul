package com.begae.backend.plan.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PopularPlanResponseDto {

    private final int status;
    private final String message;
    private final List<PopularPlanItemDto> data;
    private final int page;
    private final int limit;
    private final boolean hasNext;
    private final int totalCount;

    public static PopularPlanResponseDto of(List<PopularPlanItemDto> data, int page, int limit, int totalCount) {
        return PopularPlanResponseDto.builder()
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
