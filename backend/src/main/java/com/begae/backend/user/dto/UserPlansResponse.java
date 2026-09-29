package com.begae.backend.user.dto;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.PlanImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPlansResponse {

    private List<PlanSummary> plans;
    private int page;
    private int limit;
    private boolean hasNext;
    private long totalCount;

    public static UserPlansResponse from(org.springframework.data.domain.Page<Plan> plans) {
        return new UserPlansResponse(plans.getContent().stream().map(PlanSummary::from).toList(),
                plans.getNumber() + 1, plans.getSize(), plans.hasNext(), plans.getTotalElements());
    }

    public static UserPlansResponse from(List<Plan> plans) {
        List<PlanSummary> summaries = plans.stream()
                .map(PlanSummary::from)
                .toList();

        return new UserPlansResponse(summaries, 1, plans.size(), false, plans.size());
    }

    @Getter
    @AllArgsConstructor
    @Schema(name = "UserPlanSummary")
    public static class PlanSummary {
        private int planId;
        private String planTitle;
        private LocalDateTime createAt;
        private LocalDateTime tripStartDate;
        private LocalDateTime tripEndDate;
        private Boolean planVerified;
        private Integer bookmarkCount;
        private Integer requiredTime;
        private List<String> planImages = new ArrayList<>();

        public static PlanSummary from(Plan plan) {

            String firstImage = plan.getPlanImages().stream()
                    .map(PlanImage::getImageUrl)
                    .filter(url -> url != null && !url.isBlank())
                    .findFirst()
                    .orElse(null);

            List<String> planImages = firstImage != null
                    ? List.of(firstImage)
                    : List.of();

            return new PlanSummary(
                    plan.getPlanId(),
                    plan.getPlanTitle(),
                    plan.getCreateAt(),
                    plan.getTripStartDate(),
                    plan.getTripEndDate(),
                    plan.getIsVerified(),
                    plan.getScrapCount(),
                    plan.getRequiredTime(),
                    planImages
            );
        }
    }
}
