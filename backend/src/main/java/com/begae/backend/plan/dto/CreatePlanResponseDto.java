package com.begae.backend.plan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePlanResponseDto {
    private Integer planId;
    private String planTitle;
    private boolean isPlanVisible;
    private LocalDateTime createAt;
}
