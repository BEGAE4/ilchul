package com.begae.backend.plan_place.dto;

import com.begae.backend.plan.dto.DeparturePointDto;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class UpdatePlanPlaceRequestDto {

    private DeparturePointDto departurePoint;

    private List<UpdatePlanPlaceItemDto> places;

}
