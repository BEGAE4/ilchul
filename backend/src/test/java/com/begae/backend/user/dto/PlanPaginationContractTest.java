package com.begae.backend.user.dto;

import com.begae.backend.global.dto.ListPageRequest;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.ScrappedPlan;
import com.begae.backend.plan.dto.ScrappedPlanResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

class PlanPaginationContractTest {
    @Test
    void 기존_배열을_유지하면서_서버_페이지_정보를_추가한다() {
        var request = ListPageRequest.of(2, 20);
        var plans = new PageImpl<Plan>(List.of(), request, 45);
        var scraps = new PageImpl<ScrappedPlan>(List.of(), request, 45);
        var mapper = new ObjectMapper().findAndRegisterModules();
        var responses = List.of(MyPlansResponse.from(plans), UserPlansResponse.from(plans), ScrappedPlanResponseDto.fromScraps(scraps));
        for (var response : responses) {
            var json = mapper.valueToTree(response);
            assertThat(json.get("page").asInt()).isEqualTo(2);
            assertThat(json.get("limit").asInt()).isEqualTo(20);
            assertThat(json.get("hasNext").asBoolean()).isTrue();
            assertThat(json.get("totalCount").asLong()).isEqualTo(45);
            assertThat(json.has(response instanceof ScrappedPlanResponseDto ? "scrappedPlans" : "plans")).isTrue();
        }
    }

    @Test
    void 기본값과_최대치_잘못된_페이지를_검증한다() {
        assertThat(ListPageRequest.of(null, null).getPageSize()).isEqualTo(20);
        assertThat(ListPageRequest.of(null, null).getPageNumber()).isZero();
        assertThat(ListPageRequest.of(1, 1000).getPageSize()).isEqualTo(50);
        assertThatThrownBy(() -> ListPageRequest.of(0, 20)).isInstanceOf(CustomException.class);
        assertThatThrownBy(() -> ListPageRequest.of(1, -1)).isInstanceOf(CustomException.class);
        assertThatThrownBy(() -> ListPageRequest.of(Integer.MAX_VALUE, 20)).isInstanceOf(CustomException.class);
    }
}
