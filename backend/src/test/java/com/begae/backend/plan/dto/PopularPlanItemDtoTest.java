package com.begae.backend.plan.dto;

import com.begae.backend.plan.domain.Plan;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PopularPlanItemDtoTest {

    @Test
    void 소요시간은_분_단위_값을_시간과_분으로_표기한다() {
        assertThat(PopularPlanItemDto.of(planRequiring(150), 1).getDuration()).isEqualTo("2시간 30분");
        assertThat(PopularPlanItemDto.of(planRequiring(120), 1).getDuration()).isEqualTo("2시간");
        assertThat(PopularPlanItemDto.of(planRequiring(22), 1).getDuration()).isEqualTo("22분");
    }

    @Test
    void 소요시간이_없으면_표기하지_않는다() {
        assertThat(PopularPlanItemDto.of(planRequiring(null), 1).getDuration()).isNull();
    }

    @Test
    void 출발지가_없는_플랜도_목록_항목으로_변환된다() {
        PopularPlanItemDto dto = PopularPlanItemDto.of(planRequiring(30), 1);

        assertThat(dto.getLocation()).isNull();
    }

    private Plan planRequiring(Integer requiredMinutes) {
        return Plan.builder()
                .planTitle("테스트 플랜")
                .requiredTime(requiredMinutes)
                .likeCount(0)
                .build();
    }
}
