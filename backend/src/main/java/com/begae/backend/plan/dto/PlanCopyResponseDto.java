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
public class PlanCopyResponseDto {
    private Integer planId;

    public static PlanCopyResponseDto from(Plan plan) {
        return new PlanCopyResponseDto(plan.getPlanId());
    }
}
