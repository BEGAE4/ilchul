package com.begae.backend.place.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class PlaceReviewListResponseContractTest {

    @Test
    void 후기_목록에_전체_후기_수를_포함한다() {
        @SuppressWarnings("unchecked")
        Map<String, Object> response = new ObjectMapper().convertValue(
                PlaceReviewListResponseDto.of(List.of(), false),
                Map.class
        );

        assertThat(response).containsEntry("totalCount", 0L);
    }
}
