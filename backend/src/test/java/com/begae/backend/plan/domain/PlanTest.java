package com.begae.backend.plan.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PlanTest {

    @Test
    void 신규_플랜은_블라인드_상태가_아니다() {
        Plan plan = Plan.builder().build();

        assertThat(plan.getIsBlinded()).isFalse();
    }
}
