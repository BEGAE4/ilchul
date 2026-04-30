package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SearchPlaceRequestDto {

    String keyword;
    int radiusM;
    String x;
    String y;


}
