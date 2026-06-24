package com.begae.backend.plan.dto;

import com.begae.backend.plan.domain.Plan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanCopyResponseDto {
    private Integer planId;
    private Integer originalPlanId;
    private LocalDateTime createAt;

    public static PlanCopyResponseDto of(Plan plan, Integer originalPlanId) {
        return new PlanCopyResponseDto(plan.getPlanId(), originalPlanId, plan.getCreateAt());
    }
}
