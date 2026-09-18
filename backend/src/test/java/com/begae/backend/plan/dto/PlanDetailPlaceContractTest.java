package com.begae.backend.plan.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class PlanDetailPlaceContractTest {

    @Test
    void 플랜_상세_장소에_nullable_체류_설명_필드를_포함한다() {
        PlanDetailDto.PlanPlaceDetailDto place = PlanDetailDto.PlanPlaceDetailDto.builder()
                .planPlaceId(3)
                .placeId(9)
                .build();

        @SuppressWarnings("unchecked")
        Map<String, Object> json = new ObjectMapper().convertValue(place, Map.class);

        assertThat(json).containsKey("stayDescription");
        assertThat(json.get("stayDescription")).isNull();
    }
}
