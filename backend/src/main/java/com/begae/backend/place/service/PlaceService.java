package com.begae.backend.place.service;

import com.begae.backend.place.dto.KakaoPlaceResponseDto;
import com.begae.backend.place.dto.PlaceSummaryDto;
import com.begae.backend.place.dto.RecommendKeywordDto;
import com.begae.backend.place.dto.SurveyResultDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import reactor.core.publisher.Mono;

import java.util.List;

public interface PlaceService {
    List<PlaceSummaryDto> searchPlace(String keyword);
    Mono<PlaceSummaryDto> toPlaceSummary(KakaoPlaceResponseDto.Document document);
    void upsertPlaceFrom(KakaoPlaceResponseDto.Document document, PlaceSummaryDto dto);
    RecommendKeywordDto generateKeyword(SurveyResultDto survey) throws JsonProcessingException;
}
