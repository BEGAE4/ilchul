package com.begae.backend.user.dto;

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
public class MyPlansResponse {

    private List<PlanSummary> plans;

    @Getter
    @AllArgsConstructor
    public static class PlanSummary {
        private int planId;
        private String planTitle;
        private LocalDateTime createAt;
        private LocalDateTime tripStartDate;
        private LocalDateTime tripEndDate;
        private Boolean isPlanVisible;
        private Integer requiredTime;
        private List<String> planImages = new ArrayList<>();

//        public static PlanSummary from(Plan plan) {
//            return new PlanSummary(
//                    plan.getPlanId(),
//                    plan.getPlanTitle(),
//                    plan.getCreateAt(),
//                    plan.getTripDate(),
//
//            );
//        }
    }
}
