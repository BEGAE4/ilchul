package com.begae.backend.place.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResultDto {

    @NotBlank
    private String emotion;

    @NotBlank
    private String startTime;

    @NotBlank
    private String endTime;

    @NotBlank
    @Pattern(regexp = "도보|대중교통|자가용")
    private String transport;

    private String transportTime;

    @Valid
    @NotNull
    private Location location;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {

        @NotNull
        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        private Double x;

        @NotNull
        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        private Double y;
    }
}
