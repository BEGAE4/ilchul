package com.begae.backend.place.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class RecommendPlaceResponseDto {
    private String keyword;
    private Integer radiusM;
    private List<SearchPlaceResponseDto> places;
}
