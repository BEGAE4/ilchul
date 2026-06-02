package com.begae.backend.plan_place.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class UpdatePlanPlaceRequestDto {

    private String departurePoint;

    private List<UpdatePlanPlaceItemDto> places;

}
