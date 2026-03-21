package com.begae.backend.place.service;

import com.begae.backend.place.dto.SearchLog;
import com.begae.backend.place.dto.SearchLogDeleteRequest;
import com.begae.backend.place.dto.SearchLogSaveRequest;

import java.util.List;

public interface SearchLogService {
    void saveRecentSearchLog(Integer userId, SearchLogSaveRequest request);

    List<SearchLog> findRecentSearchLogs(Integer userId);

    void deleteRecentSearchLog(Integer userId, SearchLogDeleteRequest request);
}
