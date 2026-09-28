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
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripStartDate;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripEndDate;

    public static PlanCopyResponseDto of(Plan plan, Integer originalPlanId) {
        return new PlanCopyResponseDto(plan.getPlanId(), originalPlanId, plan.getCreateAt(),
                plan.getTripStartDate(), plan.getTripEndDate());
    }
}
