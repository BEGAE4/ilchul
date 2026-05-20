package com.begae.backend.plan.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UpdatePlanRequestDto {

    private String planTitle;
    private Boolean isPlanVisible;
    private String planDescription;

    private String departurePoint;
    private LocalDateTime tripStartDate;
    private LocalDateTime tripEndDate;

    public boolean hasVerificationRestrictedFields() {
        return departurePoint != null
                || tripStartDate != null
                || tripEndDate != null;
    }

}
