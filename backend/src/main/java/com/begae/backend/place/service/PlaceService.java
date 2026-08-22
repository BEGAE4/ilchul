package com.begae.backend.place.service;

import com.begae.backend.place.dto.*;
import com.begae.backend.plan.dto.PopularPlanItemDto;
import reactor.core.publisher.Mono;

import java.util.List;

public interface PlaceService {
    List<SearchPlaceResponseDto> searchPlaceByKeyword(String keyword);
    List<SearchPlaceResponseDto> searchPlaceForRecommend(SearchPlaceRequestDto request);
    Mono<SearchPlaceResponseDto> toPlaceSummary(KakaoPlaceResponseDto.Document document);
    int upsertPlaceFrom(KakaoPlaceResponseDto.Document document, PlaceSummaryDto dto);
    RecommendKeywordDto generateKeyword(SurveyResultDto survey);
    List<SearchPlaceResponseDto> getSearchResult(KakaoPlaceResponseDto kakaoResponse);
    PlaceDetailResponseDto getPlaceDetail(Integer placeId);
    PopularPlaceResponseDto getPopularPlaces(Double lat, Double lng, Integer limit, Integer page);

    PopularPlaceResponseDto getNationwidePopularPlaces(Integer limit, Integer page);

    List<PopularPlanItemDto> getPlansContainingPlace(Integer placeId);
}
