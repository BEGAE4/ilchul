package com.begae.backend.place.controller;

import com.begae.backend.place.dto.SearchLog;
import com.begae.backend.place.dto.SearchLogDeleteRequest;
import com.begae.backend.place.dto.SearchLogSaveRequest;
import com.begae.backend.place.exception.SearchLogNotExistException;
import com.begae.backend.place.service.SearchLogService;
import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.user.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "최근 검색어", description = "최근 검색어 조회, 저장 및 삭제 관련 API")
@Slf4j
@RestController
@RequestMapping("api/recent")
@RequiredArgsConstructor
public class SearchController {

    private final SearchLogService searchLogService;

    @Operation(summary = "최근 검색어 조회", description = "로그인한 사용자의 최근 검색어 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "최근 검색어 목록이 성공적으로 조회되었습니다.")
    @GetMapping
    public ResponseEntity<List<SearchLog>> getRecentSearchLog(@Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user) {
        List<SearchLog> logs = searchLogService.findRecentSearchLogs(user.getUserId());
        return ResponseEntity.ok().body(logs);
    }

    @Operation(summary = "최근 검색어 저장", description = "새로운 최근 검색어를 저장합니다.")
    @ApiResponse(responseCode = "200", description = "최근 검색어가 성공적으로 저장되었습니다.")
    @PostMapping
    public ResponseEntity<Void> addRecentSearchLogs(@Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user, @RequestBody SearchLogSaveRequest request) {
        searchLogService.saveRecentSearchLog(user.getUserId(), request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "최근 검색어 삭제", description = "특정 최근 검색어 기록을 삭제합니다.")
    @ApiResponse(responseCode = "204", description = "최근 검색어가 성공적으로 삭제되었습니다.")
    @DeleteMapping
    public ResponseEntity<Void> removeRecentSearchLog(@Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user, @RequestBody SearchLogDeleteRequest request) {
        searchLogService.deleteRecentSearchLog(user.getUserId(), request);
        return ResponseEntity.noContent().build();
    }
}
