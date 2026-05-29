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

    public static ScrappedPlanCreateResponseDto from(Plan plan) {
        return new ScrappedPlanCreateResponseDto(plan.getPlanId());
    }
}
