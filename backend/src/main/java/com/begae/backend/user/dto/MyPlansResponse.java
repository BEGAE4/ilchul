package com.begae.backend.user.dto;

import com.begae.backend.plan.domain.Plan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;
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
        private LocalDateTime tripDate;

        public static PlanSummary from(Plan plan) {
            return new PlanSummary(
                    plan.getPlanId(),
                    plan.getPlanTitle(),
                    plan.getCreateAt(),
                    plan.getTripDate()
            );
        }
    }
}
