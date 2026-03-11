package com.begae.backend.place.controller;

import com.begae.backend.place.dto.SearchLog;
import com.begae.backend.place.dto.SearchLogDeleteRequest;
import com.begae.backend.place.dto.SearchLogSaveRequest;
import com.begae.backend.place.exception.SearchLogNotExistException;
import com.begae.backend.place.service.SearchLogService;
import com.begae.backend.user.auth.OauthUserDetails;
import com.begae.backend.user.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("api/recent")
@RequiredArgsConstructor
public class SearchController {

    private final SearchLogService searchLogService;

    @GetMapping
    public ResponseEntity<List<SearchLog>> getRecentSearchLog(@AuthenticationPrincipal OauthUserDetails user) {
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

    @PostMapping
    public ResponseEntity<Void> addRecentSearchLogs(@AuthenticationPrincipal OauthUserDetails user, @RequestBody SearchLogSaveRequest request) {
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

    @DeleteMapping
    public ResponseEntity<Void> removeRecentSearchLog(@AuthenticationPrincipal OauthUserDetails user, @RequestBody SearchLogDeleteRequest request) {
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
}
