package com.begae.backend.plan.dto;

import com.begae.backend.plan.domain.Plan;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PlanDetailDtoTest {

    @Test
    void 소요시간과_거리가_비어있으면_0으로_응답한다() {
        Plan plan = Plan.builder().planTitle("일정 미정 플랜").build();

        PlanDetailDto dto = PlanDetailDto.from(List.of(flatWithoutRouteSummary()), false, false, plan);

        assertThat(dto.getRequiredTime()).isZero();
        assertThat(dto.getTotalDistance()).isZero();
    }

    private PlanDetailFlatDto flatWithoutRouteSummary() {
        return new PlanDetailFlatDto(
                1, "일정 미정 플랜", null, null, null, false, true, null,
                null, null,
                0, 0, 1, "tester", null,
                null, null, null, null, null, null, null, null, null, null, null
        );
    }
}
