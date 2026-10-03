package com.begae.backend.plan_place.dto;

import com.begae.backend.plan.dto.DeparturePointDto;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreatePlanPreviewRequestDto {

    @Size(max = 100)
    private String planTitle;

    @Size(max = 1000)
    private String planDescription;

    private Boolean isPlanVisible;

    @Valid @NotNull
    private DeparturePointDto departurePoint;

    @NotBlank @Pattern(regexp = "도보|대중교통|자가용")
    private String transport;

    @Size(max = 30)
    private String transportTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    @NotNull
    private LocalDateTime tripStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    @NotNull
    private LocalDateTime tripEndDate;

    @Valid @NotEmpty @Size(max = 5)
    private List<Place> places;

    @Data
    public static class Place {
        @NotNull @Positive
        private Integer placeId;

        @NotNull @Min(1) @Max(5)
        private Integer order;

        @NotNull @Min(30) @Max(90)
        private Integer stayTime;
    }

}
