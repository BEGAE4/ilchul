package com.begae.backend.plan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanDetailDto {
    private Integer planId;
    private String planTitle;
    private LocalDateTime tripStartDate;
    private LocalDateTime tripEndDate;
    private LocalDateTime createAt;
    private Boolean isVerified;
    private Boolean isPlanVisible;
    private int requiredTime;
    private int totalBudget;
    private int totalDistance;
    private String planDescription;
    private Integer likeCount;
    private Integer scrapCount;
    private List<PlanPlaceDetailDto> planPlaceDetailDtos;
    private List<String> planImages;

    public static PlanDetailDto from(List<PlanDetailFlatDto> flats) {
        PlanDetailFlatDto first = flats.getFirst();

        List<PlanPlaceDetailDto> places = flats.stream()
                .filter(f -> f.getPlanPlaceId() != null)
                .map(PlanPlaceDetailDto::from)
                .toList();

        List<String> planImages = flats.stream()
                .map(PlanDetailFlatDto::getImageUrl)
                .filter(imageUrl -> imageUrl != null)
                .toList();

        return PlanDetailDto.builder()
                .planId(first.getPlanId())
                .planTitle(first.getPlanTitle())
                .tripStartDate(first.getTripStartDate())
                .tripEndDate(first.getTripEndDate())
                .createAt(first.getCreateAt())
                .isVerified(first.getIsVerified())
                .isPlanVisible(first.getIsPlanVisible())
                .planDescription(first.getPlanDescription())
                .requiredTime(first.getRequiredTime())
                .totalDistance(first.getTotalDistance())
                .likeCount(first.getLikeCount())
                .scrapCount(first.getScrapCount())
                .planPlaceDetailDtos(places)
                .planImages(planImages)
                .build();
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanPlaceDetailDto {
        private Integer planPlaceId;
        private String placeImage;
        private String placeName;
        private String addressName;
        private String roadAddressName;
        private String categoryName;
        private Integer orderIndex;
        private Boolean isStamped;
        private Integer travelTime;
        private Integer stayTime;

        public static PlanPlaceDetailDto from(PlanDetailFlatDto flat) {
            return PlanPlaceDetailDto.builder()
                    .planPlaceId(flat.getPlanPlaceId())
                    .placeImage(flat.getPlaceImage())
                    .placeName(flat.getPlaceName())
                    .addressName(flat.getAddressName())
                    .roadAddressName(flat.getRoadAddressName())
                    .travelTime(flat.getTravelTime())
                    .orderIndex(flat.getOrderIndex())
                    .isStamped(flat.getIsStamped())
                    .categoryName(flat.getCategoryName())
                    .stayTime(flat.getStayTime())
                    .build();
        }
    }
}
