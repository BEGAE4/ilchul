package com.begae.backend.place.controller;

import com.begae.backend.place.dto.*;
import com.begae.backend.place.service.PlaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("api/place")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping("/search")
    public ResponseEntity<List<SearchPlaceResponseDto>> searchPlace(@RequestParam String keyword) {
        try {
            log.info("api request : {}", keyword);
            List<SearchPlaceResponseDto> places = placeService.searchPlaceByKeyword(keyword);
            return ResponseEntity.ok().body(places);
        } catch (Exception e) {
            log.error(e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/recommend")
    public ResponseEntity<?> recommendPlace(@RequestBody SurveyResultDto survey) {
        try {
            List<RecommendPlaceResponseDto> result =
                    placeService.generateKeyword(survey)
                            .getRecommendations()
                            .stream()
                            .map(recommendation -> {
                                SearchPlaceRequestDto requestDto = SearchPlaceRequestDto.builder()
                                        .keyword(recommendation.getKeyword())
                                        .radiusM(recommendation.getRadiusM())
                                        .x(String.valueOf(survey.getLocation().getX()))
                                        .y(String.valueOf(survey.getLocation().getY()))
                                        .build();

                                List<SearchPlaceResponseDto> places =
                                        placeService.searchPlaceForRecommend(requestDto);

                                return RecommendPlaceResponseDto.builder()
                                        .keyword(recommendation.getKeyword())
                                        .radiusM(recommendation.getRadiusM())
                                        .places(places)
                                        .build();
                            })
                            .toList();
            return ResponseEntity.ok().body(result);
        } catch (Exception e) {
            log.error("recommendPlace error", e);
            return ResponseEntity.internalServerError().build();
        }
    }

//    @GetMapping("/detail")
//    public ResponseEntity<?> getPlaceDetail()
}

