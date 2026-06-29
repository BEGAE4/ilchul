package com.begae.backend.plan_place.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class getDurationDto {
    private int totalDistance;
    private int totalDuration;
    List<Integer> sectionDuration;
}
