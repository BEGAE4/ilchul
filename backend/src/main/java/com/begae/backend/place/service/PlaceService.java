package com.begae.backend.place.service;

import com.begae.backend.place.dto.*;
import com.begae.backend.plan.dto.PopularPlanItemDto;
import reactor.core.publisher.Mono;

import java.util.List;

public interface PlaceService {
    List<SearchPlaceResponseDto> searchPlaceByKeyword(String keyword);
    Mono<SearchPlaceResponseDto> toPlaceSummary(KakaoPlaceResponseDto.Document document, String wellnessContentId);

    /** 카카오 로컬 키워드 검색 원본. Google 사진·DB 적재를 하지 않는다. */
    List<KakaoPlaceResponseDto.Document> searchRawByKeyword(String keyword, double x, double y, int radiusM);

    /** Google 사진을 붙이고 place에 upsert한 뒤 요약을 돌려준다. */
    SearchPlaceResponseDto enrichAndUpsert(KakaoPlaceResponseDto.Document document, String wellnessContentId);
    int upsertPlace(PlaceUpsertCommand command);
    List<SearchPlaceResponseDto> getSearchResult(KakaoPlaceResponseDto kakaoResponse);
    PlaceDetailResponseDto getPlaceDetail(Integer placeId);
    PopularPlaceResponseDto getPopularPlaces(Double lat, Double lng, Integer limit, Integer page);

    PopularPlaceResponseDto getNationwidePopularPlaces(Integer limit, Integer page);

    List<PopularPlanItemDto> getPlansContainingPlace(Integer placeId);
}
