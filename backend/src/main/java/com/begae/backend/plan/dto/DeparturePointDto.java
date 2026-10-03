package com.begae.backend.plan.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DeparturePointDto {
    private String name;
    private String address;
    @NotNull @DecimalMin("-180") @DecimalMax("180")
    private Double x;
    @NotNull @DecimalMin("-90") @DecimalMax("90")
    private Double y;
}
