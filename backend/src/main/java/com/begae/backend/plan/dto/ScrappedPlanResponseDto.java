package com.begae.backend.plan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScrappedPlanResponseDto {

    private List<ScrappedPlanSummary> scrappedPlans;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScrappedPlanSummary {
        private int planId;
        private String planTitle;
        private LocalDateTime createAt;
        private LocalDateTime tripStartDate;
        private LocalDateTime tripEndDate;
        private Boolean isPlanVisible;
        private Integer requiredTime;
        @Builder.Default
        private List<String> planImages = new ArrayList<>();
    }
}
