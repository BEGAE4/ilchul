package com.begae.backend.place.dto;

import com.begae.backend.place.domain.Place;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class PopularPlaceItemDtoTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void 좋아요_수는_프론트_계약대로_likes_필드로_내려간다() throws Exception {
        Place place = Place.builder()
                .placeName("서울로7017")
                .build();
        ReflectionTestUtils.setField(place, "likeCount", 12);

        JsonNode json = objectMapper.valueToTree(PopularPlaceItemDto.of(place, 1));

        assertThat(json.get("likes").asInt()).isEqualTo(12);
        assertThat(json.has("likeCount")).isFalse();
    }
}
