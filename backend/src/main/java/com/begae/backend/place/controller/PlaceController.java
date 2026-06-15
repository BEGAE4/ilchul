package com.begae.backend.place.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.place.dto.*;
import com.begae.backend.place.dto.PopularPlaceResponseDto;
import com.begae.backend.place.service.PlaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("api/place")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping("/search")
    public ResponseEntity<List<SearchPlaceResponseDto>> searchPlace(@AuthenticationPrincipal OauthUserDetails user,
                                                                    @RequestParam String keyword) {
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
    public ResponseEntity<?> recommendPlace(@AuthenticationPrincipal OauthUserDetails user,
                                            @RequestBody SurveyResultDto survey) {
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

    @GetMapping("/{placeId}")
    public ResponseEntity<PlaceDetailResponseDto> getPlaceDetail(@AuthenticationPrincipal OauthUserDetails user,
                                                                 @PathVariable Integer placeId) {
        return ResponseEntity.ok().body(placeService.getPlaceDetail(placeId));
    }

    /**
     * 전국 인기 장소 조회
     */
    @GetMapping("/popular/nationwide")
    public ResponseEntity<PopularPlaceResponseDto> getNationwidePopularPlaces(
            @RequestParam(defaultValue = "6") Integer limit,
            @RequestParam(defaultValue = "1") Integer page
    ) {
        return ResponseEntity.ok(placeService.getNationwidePopularPlaces(limit, page));
    }

    /**
     * 내 주변 인기 장소 조회
     */
    @GetMapping("/popular")
    public ResponseEntity<PopularPlaceResponseDto> getPopularPlaces(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5") Integer limit,
            @RequestParam(defaultValue = "1") Integer page
    ) {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE);
        }
        return ResponseEntity.ok(placeService.getPopularPlaces(lat, lng, limit, page));
    }

}

