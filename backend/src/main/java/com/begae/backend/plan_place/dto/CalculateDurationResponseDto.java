package com.begae.backend.plan_place.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CalculateDurationResponseDto {

    private int totalDuration;

    private List<Integer> sectionDuration;

}
