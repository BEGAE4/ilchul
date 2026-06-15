package com.begae.backend.plan_place.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdatePlanPlaceItemDto {

    /**
     * 기존 PlanPlace면 값 존재.
     * 새로 추가한 장소면 null.
     */
    private Integer planPlaceId;

    private Integer placeId;

    private Integer order;

}
