package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SearchResultResponseDto {

    private final String keyword;

    private final List<SearchPlaceResultDto> places;

    private final List<SearchPlanResultDto> plans;

    private final int page;

    private final int limit;

    private final int placeTotalCount;

    private final int planTotalCount;

    private final boolean hasNextPlace;

    private final boolean hasNextPlan;

    public static SearchResultResponseDto of(
            String keyword,
            List<SearchPlaceResultDto> places,
            List<SearchPlanResultDto> plans,
            int page,
            int limit,
            int placeTotalCount,
            int planTotalCount
    ) {
        return SearchResultResponseDto.builder()
                .keyword(keyword)
                .places(places)
                .plans(plans)
                .page(page)
                .limit(limit)
                .placeTotalCount(placeTotalCount)
                .planTotalCount(planTotalCount)
                .hasNextPlace((long) page * limit < placeTotalCount)
                .hasNextPlan((long) page * limit < planTotalCount)
                .build();
    }
}
