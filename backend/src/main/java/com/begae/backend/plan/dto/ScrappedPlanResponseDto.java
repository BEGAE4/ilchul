package com.begae.backend.plan.dto;

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
public class ScrappedPlanResponseDto {

    private List<ScrappedPlanSummary> scrappedPlans;

    public static ScrappedPlanResponseDto from(List<Plan> plans) {
        List<ScrappedPlanSummary> summaries = plans.stream()
                .map(ScrappedPlanSummary::from)
                .toList();

        return ScrappedPlanResponseDto.builder()
                .scrappedPlans(summaries)
                .build();
    }

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

        public static ScrappedPlanSummary from(Plan plan) {
            List<String> images = plan.getPlanPlaces().stream()
                    .map(planPlace -> planPlace.getPlace().getPlaceImageUrl())
                    .filter(url -> url != null && !url.isBlank())
                    .toList();

            return ScrappedPlanSummary.builder()
                    .planId(plan.getPlanId())
                    .planTitle(plan.getPlanTitle())
                    .isPlanVisible(plan.getIsPlanVisible())
                    .tripStartDate(plan.getTripStartDate())
                    .tripEndDate(plan.getTripEndDate())
                    .requiredTime(plan.getRequiredTime())
                    .createAt(plan.getCreateAt())
                    .planImages(images)
                    .build();
        }
    }
}
