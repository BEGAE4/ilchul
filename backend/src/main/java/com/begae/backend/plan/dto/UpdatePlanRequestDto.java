package com.begae.backend.plan.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UpdatePlanRequestDto {

    private String planTitle;
    private Boolean isPlanVisible;
    private String planDescription;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripEndDate;

    public boolean hasVerificationRestrictedFields() {
        return tripStartDate != null
                || tripEndDate != null;
    }

}
