package com.begae.backend.user.dto;

import com.begae.backend.plan.domain.Plan;
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

    public static MyPlansResponse from(List<Plan> plans) {
        List<PlanSummary> summaries = plans.stream()
                .map(PlanSummary::from)
                .toList();

        return new MyPlansResponse(summaries);
    }

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

        public static PlanSummary from(Plan plan) {
            List<String> images = plan.getPlanPlaces().stream()
                    .map(planPlace -> planPlace.getPlace().getPlaceImageUrl())
                    .filter(url -> url != null && !url.isBlank())
                    .toList();

            return new PlanSummary(
                    plan.getPlanId(),
                    plan.getPlanTitle(),
                    plan.getCreateAt(),
                    plan.getTripStartDate(),
                    plan.getTripEndDate(),
                    plan.getIsPlanVisible(),
                    plan.getRequiredTime(),
                    images
            );
        }
    }
}
