package com.begae.backend.plan.dto;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.ScrappedPlan;
import com.begae.backend.user.domain.User;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ScrappedPlanResponseContractTest {

    @Test
    void 저장_플랜_요약에_저장한_시각_필드를_포함한다() {
        User user = User.builder().userNickname("사용자").build();
        Plan plan = Plan.builder().planId(1).planTitle("저장 플랜").user(user).build();
        ScrappedPlan scrap = ScrappedPlan.of(user, plan);
        ScrappedPlanResponseDto.ScrappedPlanSummary summary =
                ScrappedPlanResponseDto.fromScraps(List.of(scrap)).getScrappedPlans().getFirst();

        assertThat(summary.getScrappedAt()).isEqualTo(scrap.getScrappedAt());
    }
}
