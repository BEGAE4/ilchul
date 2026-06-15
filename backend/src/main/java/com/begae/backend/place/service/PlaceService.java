package com.begae.backend.place.service;

import com.begae.backend.place.dto.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import reactor.core.publisher.Mono;

import java.util.List;

public interface PlaceService {
    List<SearchPlaceResponseDto> searchPlaceByKeyword(String keyword);
    List<SearchPlaceResponseDto> searchPlaceForRecommend(SearchPlaceRequestDto request);
    Mono<SearchPlaceResponseDto> toPlaceSummary(KakaoPlaceResponseDto.Document document);
    int upsertPlaceFrom(KakaoPlaceResponseDto.Document document, PlaceSummaryDto dto);
    RecommendKeywordDto generateKeyword(SurveyResultDto survey) throws JsonProcessingException;
    List<SearchPlaceResponseDto> getSearchResult(KakaoPlaceResponseDto kakaoResponse);
    PlaceDetailResponseDto getPlaceDetail(Integer placeId);
    PopularPlaceResponseDto getPopularPlaces(Double lat, Double lng, Integer limit, Integer page);

    PopularPlaceResponseDto getNationwidePopularPlaces(Integer limit, Integer page);
}
