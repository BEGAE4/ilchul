package com.begae.backend.place.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ScrappedPlaceCreateResponseDto {
    private final Integer placeId;
    private final Boolean isBookmarked;
    private final Integer bookmarkCount;

    public static ScrappedPlaceCreateResponseDto from(com.begae.backend.place.domain.Place place, Boolean isBookmarked) {
        return new ScrappedPlaceCreateResponseDto(
                place.getPlaceId(),
                isBookmarked,
                place.getScrapCount()
        );
    }
}
