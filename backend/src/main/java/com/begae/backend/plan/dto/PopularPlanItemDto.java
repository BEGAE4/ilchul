package com.begae.backend.plan.dto;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan_place.domain.PlanPlace;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PopularPlanItemDto {

    private Integer id;
    private String title;
    private String description;
    private String thumbnail;
    private String location;
    private String duration;
    private Integer likes;
    private Integer ranking;

    public static PopularPlanItemDto of(Plan plan, int ranking) {
        String thumbnail = plan.getPlanPlaces().stream()
                .filter(pp -> pp.getOrderIndex() != null)
                .min((a, b) -> a.getOrderIndex().compareTo(b.getOrderIndex()))
                .map(PlanPlace::getPlace)
                .map(place -> place != null ? place.getPlaceImageUrl() : null)
                .orElse(null);

        String duration = plan.getRequiredTime() != null
                ? plan.getRequiredTime() + "시간"
                : null;

        return PopularPlanItemDto.builder()
                .id(plan.getPlanId())
                .title(plan.getPlanTitle())
                .description(plan.getPlanDescription())
                .thumbnail(thumbnail)
                .location(plan.getDeparturePoint())
                .duration(duration)
                .likes(plan.getLikeCount())
                .ranking(ranking)
                .build();
    }
}
