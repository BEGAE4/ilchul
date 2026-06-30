package com.begae.backend.place.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.like.service.LikeService;
import com.begae.backend.place.dto.*;
import com.begae.backend.place.dto.PopularPlaceResponseDto;
import com.begae.backend.place.service.PlaceReviewService;
import com.begae.backend.place.service.PlaceService;
import com.begae.backend.place.service.ScrappedPlaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "장소", description = "장소 조회, 추천, 좋아요, 스크랩 및 후기 관련 API")
@Slf4j
@RestController
@RequestMapping("api/place")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;
    private final LikeService likeService;
    private final ScrappedPlaceService scrappedPlaceService;
    private final PlaceReviewService placeReviewService;

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

    /**
     * 장소 좋아요 등록 (멱등성 보장)
     */
    @PostMapping("/{placeId}/likes")
    @Operation(summary = "장소 좋아요 등록", description = "특정 장소에 좋아요를 등록합니다.")
    @ApiResponse(responseCode = "200", description = "좋아요가 성공적으로 등록되었습니다.")
    public ResponseEntity<com.begae.backend.like.dto.LikeResponseDto> likePlace(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "장소 ID", example = "1") @PathVariable Integer placeId
    ) {
        return ResponseEntity.ok(likeService.likePlace(placeId, user.getUserId()));
    }

    /**
     * 장소 좋아요 취소 (멱등성 보장)
     */
    @DeleteMapping("/{placeId}/likes")
    @Operation(summary = "장소 좋아요 취소", description = "특정 장소에 등록된 좋아요를 취소합니다.")
    @ApiResponse(responseCode = "200", description = "좋아요가 성공적으로 취소되었습니다.")
    public ResponseEntity<com.begae.backend.like.dto.LikeResponseDto> unlikePlace(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "장소 ID", example = "1") @PathVariable Integer placeId
    ) {
        return ResponseEntity.ok(likeService.unlikePlace(placeId, user.getUserId()));
    }

    /**
     * 장소 스크랩 등록 (멱등성 보장)
     */
    @PostMapping("/{placeId}/scraps")
    @Operation(summary = "장소 스크랩 추가", description = "특정 장소를 스크랩(북마크) 목록에 추가합니다.")
    @ApiResponse(responseCode = "200", description = "장소가 성공적으로 스크랩되었습니다.")
    public ResponseEntity<ScrappedPlaceCreateResponseDto> scrapPlace(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "장소 ID", example = "1") @PathVariable Integer placeId
    ) {
        return ResponseEntity.ok(scrappedPlaceService.scrapPlace(user.getUserId(), placeId));
    }

    /**
     * 장소 스크랩 취소 (멱등성 보장)
     */
    @DeleteMapping("/{placeId}/scraps")
    @Operation(summary = "장소 스크랩 취소", description = "특정 장소의 스크랩을 취소합니다.")
    @ApiResponse(responseCode = "200", description = "스크랩이 성공적으로 취소되었습니다.")
    public ResponseEntity<ScrappedPlaceCreateResponseDto> unscrapPlace(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "장소 ID", example = "1") @PathVariable Integer placeId
    ) {
        return ResponseEntity.ok(scrappedPlaceService.unscrapPlace(user.getUserId(), placeId));
    }

    /**
     * 장소 후기 목록 조회 (No-offset 페이징)
     */
    @GetMapping("/{placeId}/review")
    @Operation(summary = "장소 후기 목록 조회", description = "특정 장소에 작성된 후기 목록을 페이징하여 조회합니다. (비로그인 사용자도 조회 가능)")
    @ApiResponse(responseCode = "200", description = "후기 목록이 성공적으로 조회되었습니다.")
    public ResponseEntity<PlaceReviewListResponseDto> getPlaceReviews(
            @Parameter(description = "장소 ID", example = "1") @PathVariable Integer placeId,
            @Parameter(description = "마지막으로 조회된 후기 ID (커서 페이징용)", example = "100") @RequestParam(required = false) Integer lastReviewId,
            @Parameter(description = "페이지 크기", example = "10") @RequestParam(defaultValue = "10") Integer limit
    ) {
        return ResponseEntity.ok(placeReviewService.getReviews(placeId, lastReviewId, limit));
    }

    /**
     * 장소 후기 작성
     */
    @PostMapping("/{placeId}/review")
    @Operation(summary = "장소 후기 작성", description = "특정 장소에 새로운 후기를 작성합니다.")
    @ApiResponse(responseCode = "201", description = "후기가 성공적으로 작성되었습니다.")
    public ResponseEntity<PlaceReviewResponseDto> writePlaceReview(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "장소 ID", example = "1") @PathVariable Integer placeId,
            @RequestBody @jakarta.validation.Valid PlaceReviewRequestDto request
    ) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(placeReviewService.writeReview(placeId, user.getUserId(), request));
    }

    /**
     * 장소가 포함된 코스 조회
     */
    @GetMapping("/{placeId}/plan")
    @Operation(summary = "장소가 포함된 코스 조회", description = "특정 장소가 포함된 공개 코스 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "코스 목록이 성공적으로 조회되었습니다.")
    public ResponseEntity<List<com.begae.backend.plan.dto.PopularPlanItemDto>> getPlansContainingPlace(
            @Parameter(description = "장소 ID", example = "1") @PathVariable Integer placeId
    ) {
        return ResponseEntity.ok(placeService.getPlansContainingPlace(placeId));
    }

}
