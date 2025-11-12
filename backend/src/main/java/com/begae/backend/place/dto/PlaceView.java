package com.begae.backend.place.dto;

import lombok.Data;

@Data
public class PlaceView {
    String sourceId;
    String addressName;
    String roadAddressName;
    String categoryName;
    String phone;
    String placeName;
    String placeUrl;
    String placeImageUrl;
    String x;
    String y;
}
