package com.begae.backend.plan.dto;

import com.begae.backend.plan.domain.DeparturePoint;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class CreatePlanRequestDto {

    @Size(max = 100)
    private String planTitle;

    private Boolean isPlanVisible;

    @Size(max = 1000)
    private String planDescription;

    private Integer requiredTime;

    private Integer totalDistance;

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
    private List<CreatePlanPlaceRequest> places;

    @Data
    @NoArgsConstructor
    public static class CreatePlanPlaceRequest {
        @NotNull @Positive
        private Integer placeId;
        @NotNull @Min(1) @Max(5)
        private Integer order;
        private Integer travelTime;
        @NotNull @Min(30) @Max(90)
        private Integer stayTime;
    }


}
