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

        return PopularPlanItemDto.builder()
                .id(plan.getPlanId())
                .title(plan.getPlanTitle())
                .description(plan.getPlanDescription())
                .thumbnail(thumbnail)
                .location(plan.getDeparturePoint() != null ? plan.getDeparturePoint().getName() : null)
                .duration(formatDuration(plan.getRequiredTime()))
                .likes(plan.getLikeCount())
                .ranking(ranking)
                .build();
    }

    /** requiredTime 은 분 단위다. */
    public static String formatDuration(Integer requiredMinutes) {
        if (requiredMinutes == null) {
            return null;
        }
        int hours = requiredMinutes / 60;
        int minutes = requiredMinutes % 60;
        if (hours == 0) {
            return minutes + "분";
        }
        return minutes == 0 ? hours + "시간" : hours + "시간 " + minutes + "분";
    }
}
