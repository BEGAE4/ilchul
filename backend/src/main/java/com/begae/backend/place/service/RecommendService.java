package com.begae.backend.place.service;

import com.begae.backend.place.dto.RecommendResponseDto;
import com.begae.backend.place.dto.SurveyResultDto;

public interface RecommendService {
    RecommendResponseDto recommend(SurveyResultDto survey);
}
