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
    private Boolean planVerified;
    private Boolean isPlanVisible;
    private Boolean isBookmarked;
    private Boolean isLiked;
    private int requiredTime;
    private int totalDistance;
    private String planDescription;
    private Integer likeCount;
    private Integer bookmarkCount;
    private Integer userId;
    private String userNickName;
    private String userAvatar;
    private List<String> planImageUrls;
    private List<String> tags;
    private String thumbnailUrl;

    private List<PlanPlaceDetailDto> planPlaceDetailDtos;
    private List<String> planImages;

    public static PlanDetailDto from(List<PlanDetailFlatDto> flats, Boolean isLiked, Boolean isBookmarked) {
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
                .planVerified(first.getIsVerified())
                .isPlanVisible(first.getIsPlanVisible())
                .planDescription(first.getPlanDescription())
                .requiredTime(first.getRequiredTime())
                .totalDistance(first.getTotalDistance())
                .likeCount(first.getLikeCount())
                .bookmarkCount(first.getScrapCount())
                .isLiked(isLiked)
                .isBookmarked(isBookmarked)
                .userId(first.getUserId())
                .userNickName(first.getUserNickname())
                .userAvatar(first.getUserImg())
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
        private Integer placeId;
        private String placeImage;
        private String placeName;
        private String categoryName;
        private String address;
        private String roadAddress;
        private Integer orderIndex;
        private String visitTime;
        private String stayDescription;
        private Boolean isStamped;
        private Integer travelTime;
        private Integer stayTime;

        public static PlanPlaceDetailDto from(PlanDetailFlatDto flat) {
            return PlanPlaceDetailDto.builder()
                    .planPlaceId(flat.getPlanPlaceId())
                    .placeId(flat.getPlaceId())
                    .placeImage(flat.getPlaceImage())
                    .placeName(flat.getPlaceName())
                    .address(flat.getAddressName())
                    .roadAddress(flat.getRoadAddressName())
                    .travelTime(flat.getTravelTime())
                    .orderIndex(flat.getOrderIndex())
                    .isStamped(flat.getIsStamped())
                    .categoryName(flat.getCategoryName())
                    .stayTime(flat.getStayTime())
                    .build();
        }
    }
}
