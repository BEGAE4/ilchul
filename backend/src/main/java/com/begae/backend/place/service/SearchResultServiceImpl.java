package com.begae.backend.place.service;

import com.begae.backend.place.dto.SearchLogSaveRequest;
import com.begae.backend.place.dto.SearchPlaceResultDto;
import com.begae.backend.place.dto.SearchPlanPlaceResultDto;
import com.begae.backend.place.dto.SearchPlanResultDto;
import com.begae.backend.place.dto.SearchResultResponseDto;
import com.begae.backend.place.repository.SearchResultRepository;
import com.begae.backend.place.util.SearchKeywordPolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchResultServiceImpl implements SearchResultService {

    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 30;

    private final SearchResultRepository searchResultRepository;
    private final SearchKeywordPolicy searchKeywordPolicy;
    private final SearchLogService searchLogService;

    @Override
    public SearchResultResponseDto search(Integer userId, String rawKeyword, Integer page, Integer limit) {
        String keyword = searchKeywordPolicy.normalize(rawKeyword);

        if (!searchKeywordPolicy.isRecordable(keyword)) {
            return SearchResultResponseDto.of(
                    keyword,
                    List.of(),
                    List.of(),
                    resolvePage(page),
                    resolveLimit(limit),
                    0,
                    0
            );
        }

        saveSearchLog(userId, keyword);

        int actualPage = resolvePage(page);
        int actualLimit = resolveLimit(limit);
        int offset = (actualPage - 1) * actualLimit;

        List<SearchPlaceResultDto> places = searchResultRepository.searchPlaces(keyword, actualLimit, offset)
                .stream()
                .map(this::toPlaceDto)
                .toList();

        List<SearchResultRepository.SearchPlanProjection> planRows =
                searchResultRepository.searchPlans(keyword, actualLimit, offset);

        List<Integer> planIds = planRows.stream()
                .map(SearchResultRepository.SearchPlanProjection::getPlanId)
                .toList();

        Map<Integer, List<SearchPlanPlaceResultDto>> planPlaceMap = findPlanPlaceMap(planIds, keyword);

        List<SearchPlanResultDto> plans = planRows.stream()
                .map(row -> toPlanDto(row, planPlaceMap.getOrDefault(row.getPlanId(), List.of())))
                .toList();

        int placeTotalCount = toInt(searchResultRepository.countPlaces(keyword));
        int planTotalCount = toInt(searchResultRepository.countPlans(keyword));

        return SearchResultResponseDto.of(
                keyword,
                places,
                plans,
                actualPage,
                actualLimit,
                placeTotalCount,
                planTotalCount
        );
    }

    private void saveSearchLog(Integer userId, String keyword) {
        if (userId == null) {
            return;
        }

        try {
            searchLogService.saveRecentSearchLog(userId, SearchLogSaveRequest.of(keyword));
        } catch (Exception e) {
            log.warn("검색 로그 저장 중 오류가 발생했습니다. userId={}, keyword={}", userId, keyword, e);
        }
    }

    private Map<Integer, List<SearchPlanPlaceResultDto>> findPlanPlaceMap(
            List<Integer> planIds,
            String keyword
    ) {
        if (planIds == null || planIds.isEmpty()) {
            return Map.of();
        }

        return searchResultRepository.findPlanPlacesByPlanIds(planIds, keyword)
                .stream()
                .collect(Collectors.groupingBy(
                        SearchResultRepository.SearchPlanPlaceProjection::getPlanId,
                        Collectors.mapping(this::toPlanPlaceDto, Collectors.toList())
                ));
    }

    private SearchPlaceResultDto toPlaceDto(SearchResultRepository.SearchPlaceProjection row) {
        return SearchPlaceResultDto.builder()
                .placeId(row.getPlaceId())
                .placeName(row.getPlaceName())
                .addressName(row.getAddressName())
                .roadAddressName(row.getRoadAddressName())
                .categoryName(row.getCategoryName())
                .placeImageUrl(row.getPlaceImageUrl())
                .x(row.getX())
                .y(row.getY())
                .likeCount(toInt(row.getLikeCount()))
                .scrapCount(toInt(row.getScrapCount()))
                .includedPlanCount(toInt(row.getIncludedPlanCount()))
                .build();
    }

    private SearchPlanResultDto toPlanDto(
            SearchResultRepository.SearchPlanProjection row,
            List<SearchPlanPlaceResultDto> places
    ) {
        return SearchPlanResultDto.builder()
                .planId(row.getPlanId())
                .planTitle(row.getPlanTitle())
                .planDescription(row.getPlanDescription())
                .requiredTime(toInt(row.getRequiredTime()))
                .totalDistance(toInt(row.getTotalDistance()))
                .likeCount(toInt(row.getLikeCount()))
                .scrapCount(toInt(row.getScrapCount()))
                .createAt(toLocalDateTime(row.getCreateAt()))
                .thumbnailUrl(row.getThumbnailUrl())
                .matchedByPlace(toBoolean(row.getMatchedByPlace()))
                .places(places)
                .build();
    }

    private SearchPlanPlaceResultDto toPlanPlaceDto(
            SearchResultRepository.SearchPlanPlaceProjection row
    ) {
        return SearchPlanPlaceResultDto.builder()
                .planPlaceId(row.getPlanPlaceId())
                .placeId(row.getPlaceId())
                .placeName(row.getPlaceName())
                .categoryName(row.getCategoryName())
                .addressName(row.getAddressName())
                .roadAddressName(row.getRoadAddressName())
                .placeImageUrl(row.getPlaceImageUrl())
                .orderIndex(toInt(row.getOrderIndex()))
                .matched(toBoolean(row.getMatched()))
                .build();
    }

    private int resolvePage(Integer page) {
        if (page == null || page <= 0) {
            return DEFAULT_PAGE;
        }

        return page;
    }

    private int resolveLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }

        return Math.min(limit, MAX_LIMIT);
    }

    private int toInt(Number value) {
        return value == null ? 0 : value.intValue();
    }

    private boolean toBoolean(Number value) {
        return value != null && value.intValue() > 0;
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
