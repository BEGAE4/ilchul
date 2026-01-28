package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SurveyResultDto {
    String emotion;
    String startTime;
    String durationMinutes;
}
