package com.begae.backend.place.service;

import com.begae.backend.place.dto.SearchResultResponseDto;

public interface SearchResultService {

    SearchResultResponseDto search(Integer userId, String keyword, Integer page, Integer limit);
}
