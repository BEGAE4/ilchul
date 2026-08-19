package com.begae.backend.place.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.place.dto.PopularSearchKeywordDto;
import com.begae.backend.place.dto.SearchAutocompleteItemDto;
import com.begae.backend.place.dto.SearchLog;
import com.begae.backend.place.dto.SearchLogDeleteRequest;
import com.begae.backend.place.dto.SearchLogSaveRequest;
import com.begae.backend.place.dto.SearchResultResponseDto;
import com.begae.backend.place.exception.SearchLogNotExistException;
import com.begae.backend.place.service.PopularSearchService;
import com.begae.backend.place.service.SearchAutocompleteService;
import com.begae.backend.place.service.SearchLogService;
import com.begae.backend.place.service.SearchResultService;
import com.begae.backend.user.exception.UserNotFoundException;
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

@Tag(name = "검색", description = "통합 검색, 최근 검색어, 인기 검색어 및 자동완성 관련 API")
@Slf4j
@RestController
@RequestMapping("api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchLogService searchLogService;
    private final PopularSearchService popularSearchService;
    private final SearchAutocompleteService searchAutocompleteService;
    private final SearchResultService searchResultService;

    @GetMapping("/recent")
    @Operation(summary = "최근 검색어 조회", description = "현재 로그인한 사용자의 최근 검색어 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "최근 검색어 목록이 성공적으로 조회되었습니다.")
    public ResponseEntity<List<SearchLog>> getRecentSearchLog(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user
    ) {
        try {
            List<SearchLog> logs = searchLogService.findRecentSearchLogs(user.getUserId());
            return ResponseEntity.ok().body(logs);
        } catch (UserNotFoundException e) {
            log.error(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error(e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/recent")
    @Operation(summary = "최근 검색어 저장", description = "현재 로그인한 사용자의 최근 검색어를 저장합니다. 저장된 검색어는 인기 검색어 및 자동완성 집계에도 활용됩니다.")
    @ApiResponse(responseCode = "200", description = "최근 검색어가 성공적으로 저장되었습니다.")
    public ResponseEntity<Void> addRecentSearchLogs(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @RequestBody SearchLogSaveRequest request
    ) {
        try {
            searchLogService.saveRecentSearchLog(user.getUserId(), request);
            return ResponseEntity.ok().build();
        } catch (UserNotFoundException e) {
            log.error(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error(e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/recent")
    @Operation(summary = "최근 검색어 삭제", description = "현재 로그인한 사용자의 최근 검색어 중 특정 검색어를 삭제합니다.")
    @ApiResponse(responseCode = "204", description = "최근 검색어가 성공적으로 삭제되었습니다.")
    public ResponseEntity<Void> removeRecentSearchLog(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @RequestBody SearchLogDeleteRequest request
    ) {
        try {
            searchLogService.deleteRecentSearchLog(user.getUserId(), request);
            return ResponseEntity.noContent().build();
        } catch (UserNotFoundException | SearchLogNotExistException e) {
            log.error(e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error(e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/popular")
    @Operation(summary = "인기 검색어 조회", description = "현재 월 기준 인기 검색어 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "인기 검색어 목록이 성공적으로 조회되었습니다.")
    public List<PopularSearchKeywordDto> findPopularKeywords() {
        return popularSearchService.findMonthlyTopKeywords();
    }

    @GetMapping("/autocomplete")
    @Operation(summary = "검색어 자동완성", description = "입력한 키워드를 기준으로 최근 검색어, 인기 검색어, 카테고리, 장소명을 조합한 자동완성 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "자동완성 목록이 성공적으로 조회되었습니다.")
    public List<SearchAutocompleteItemDto> autocomplete(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "자동완성 기준 키워드", example = "카페") @RequestParam String keyword,
            @Parameter(description = "조회 개수", example = "5") @RequestParam(required = false, defaultValue = "5") Integer limit
    ) {
        return searchAutocompleteService.autocomplete(user.getUserId(), keyword, limit);
    }

    @GetMapping
    @Operation(summary = "통합 검색", description = "사용자가 직접 입력한 검색어를 기준으로 관련 장소와 관련 플랜을 함께 조회합니다. 장소명이 검색어와 일치하는 경우 해당 장소가 포함된 공개 플랜을 우선 조회합니다.")
    @ApiResponse(responseCode = "200", description = "통합 검색 결과가 성공적으로 조회되었습니다.")
    public ResponseEntity<SearchResultResponseDto> search(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "검색 키워드", example = "카페") @RequestParam String keyword,
            @Parameter(description = "페이지 번호", example = "1") @RequestParam(required = false, defaultValue = "1") Integer page,
            @Parameter(description = "페이지당 조회 개수", example = "10") @RequestParam(required = false, defaultValue = "10") Integer limit
    ) {
        Integer userId = user == null ? null : user.getUserId();

        return ResponseEntity.ok(
                searchResultService.search(userId, keyword, page, limit)
        );
    }
}