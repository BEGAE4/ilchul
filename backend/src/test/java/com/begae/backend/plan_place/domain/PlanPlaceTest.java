package com.begae.backend.plan_place.domain;

import com.begae.backend.plan.domain.Plan;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PlanPlaceTest {

    @Test
    void 복제한_장소에는_원본_사용자의_스탬프_사진을_가져오지_않는다() {
        PlanPlace source = PlanPlace.builder().isStamped(true).build();
        source.getPlanPlaceImages().add(PlanPlaceImage.builder()
                .imageKey("planPlace/1/image/original.png")
                .imageUrl("https://s3.example.com/ilchul/planPlace/1/image/original.png")
                .planPlace(source)
                .build());

        PlanPlace copied = PlanPlace.copyOf(source, Plan.builder().build());

        assertThat(copied.getIsStamped()).isFalse();
        assertThat(copied.getPlanPlaceImages()).isEmpty();
    }
}
