package com.begae.backend.plan.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlanCopyRequestDto {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate scheduledDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripEndDate;

}
