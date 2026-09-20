package com.begae.backend.plan.domain;

import com.begae.backend.user.domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ScrappedPlanTest {

    @Test
    void 취소한_플랜을_다시_스크랩하면_스크랩_시각을_갱신한다() {
        User user = User.builder().build();
        Plan plan = Plan.builder().scrapCount(0).build();
        ScrappedPlan scrap = ScrappedPlan.of(user, plan);
        LocalDateTime oldScrappedAt = LocalDateTime.now().minusDays(1);
        ReflectionTestUtils.setField(scrap, "scrappedAt", oldScrappedAt);

        scrap.toggle();
        scrap.toggle();

        assertThat(scrap.getScrappedAt()).isAfter(oldScrappedAt);
    }
}
