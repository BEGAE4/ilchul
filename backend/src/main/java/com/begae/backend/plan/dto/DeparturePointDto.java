package com.begae.backend.plan.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DeparturePointDto {
    private String name;
    private String address;
    private Double x;
    private Double y;
}
