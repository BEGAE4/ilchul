package com.begae.backend.plan.dto;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.PlanImage;
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

    @Test
    void 렌더링할_수_없는_사진은_사진_목록과_대표_이미지에서_제외한다() {
        Plan plan = Plan.builder().planTitle("사진 플랜").build();
        plan.getPlanImages().add(PlanImage.builder().planImageId(1).imageUrl(null).build());
        plan.getPlanImages().add(PlanImage.builder().planImageId(2).imageUrl("https://cdn.il-chul.com/plan/1/image/b.png").build());

        PlanDetailDto dto = PlanDetailDto.from(List.of(flatWithoutRouteSummary()), false, false, plan);

        assertThat(dto.getPlanImages()).extracting(PlanDetailDto.PlanImageDto::getPlanImageId).containsExactly(2);
        assertThat(dto.getPlanImageUrls()).containsExactly("https://cdn.il-chul.com/plan/1/image/b.png");
        assertThat(dto.getThumbnailUrl()).isEqualTo("https://cdn.il-chul.com/plan/1/image/b.png");
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
