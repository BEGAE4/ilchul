package com.begae.backend.place.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class KakaoPlaceResponseDto {

    List<Document> documents;

    @Data
    public static class Document {

        private String id;

        @JsonProperty("address_name")
        private String addressName;

        @JsonProperty("category_group_name")
        private String categoryGroupName;

        @JsonProperty("category_name")
        private String categoryName;

        private String distance;

        private String phone;

        @JsonProperty("place_name")
        private String placeName;

        @JsonProperty("place_url")
        private String placeUrl;

        @JsonProperty("road_address_name")
        private String roadAddressName;

        private String x;
        private String y;

    }
}
