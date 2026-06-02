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

    private LocalDateTime tripStartDate;
    private LocalDateTime tripEndDate;

    public boolean hasVerificationRestrictedFields() {
        return tripStartDate != null
                || tripEndDate != null;
    }

}
