package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PopularSearchKeywordDto {

    private final Integer ranking;
    private final String keyword;
    private final Double score;
}
