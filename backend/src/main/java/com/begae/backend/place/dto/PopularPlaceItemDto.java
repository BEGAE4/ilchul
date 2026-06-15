package com.begae.backend.place.dto;

import com.begae.backend.place.domain.Place;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PopularPlaceItemDto {

    private Integer id;
    private String name;
    private String category;
    private String location;
    private String image;
    private Integer ranking;

    public static PopularPlaceItemDto of(Place place, int ranking) {
        return PopularPlaceItemDto.builder()
                .id(place.getPlaceId())
                .name(place.getPlaceName())
                .category(place.getCategoryName())
                .location(place.getAddressName())
                .image(place.getPlaceImageUrl())
                .ranking(ranking)
                .build();
    }
}
