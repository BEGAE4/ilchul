package com.begae.backend.plan.dto;

import com.begae.backend.plan.domain.Plan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScrappedPlanCreateResponseDto {
    private Integer planId;
    private Boolean isBookmarked;
    private Integer bookmarkCount;

    public static ScrappedPlanCreateResponseDto from(Plan plan, Boolean isBookmarked) {
        return new ScrappedPlanCreateResponseDto(
                plan.getPlanId(),
                isBookmarked,
                plan.getScrapCount());
    }
}
