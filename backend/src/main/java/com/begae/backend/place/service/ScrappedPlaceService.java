package com.begae.backend.place.service;

import com.begae.backend.place.dto.ScrappedPlaceCreateResponseDto;

public interface ScrappedPlaceService {
    ScrappedPlaceCreateResponseDto scrapPlace(Integer userId, Integer placeId);
    ScrappedPlaceCreateResponseDto unscrapPlace(Integer userId, Integer placeId);
}
