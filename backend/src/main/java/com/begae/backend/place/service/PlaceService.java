package com.begae.backend.place.service;

import com.begae.backend.place.dto.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import reactor.core.publisher.Mono;

import java.util.List;

public interface PlaceService {
    List<SearchPlaceResponseDto> searchPlace(String keyword);
    Mono<SearchPlaceResponseDto> toPlaceSummary(KakaoPlaceResponseDto.Document document);
    int upsertPlaceFrom(KakaoPlaceResponseDto.Document document, PlaceSummaryDto dto);
    RecommendKeywordDto generateKeyword(SurveyResultDto survey) throws JsonProcessingException;
}
