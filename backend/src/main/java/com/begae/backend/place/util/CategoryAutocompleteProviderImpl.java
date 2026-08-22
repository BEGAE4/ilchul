package com.begae.backend.place.util;

import com.begae.backend.place.dto.AutocompleteType;
import com.begae.backend.place.dto.SearchAutocompleteItemDto;
import com.begae.backend.place.repository.PlaceAutocompleteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryAutocompleteProviderImpl implements CategoryPlaceAutocompleteProvider {

    private static final int CATEGORY_FETCH_MULTIPLIER = 5;

    private final PlaceAutocompleteRepository placeAutocompleteRepository;

    @Override
    public List<SearchAutocompleteItemDto> findCategoryCandidates(String prefix, int limit) {
        if (prefix == null || prefix.isBlank() || limit <= 0) {
            return List.of();
        }

        List<PlaceAutocompleteRepository.CategoryAutocompleteProjection> rows =
                placeAutocompleteRepository.findCategoryAutocompleteCandidates(
                        prefix,
                        Math.max(limit * CATEGORY_FETCH_MULTIPLIER, limit)
                );

        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        Map<String, SearchAutocompleteItemDto> merged = new LinkedHashMap<>();

        for (PlaceAutocompleteRepository.CategoryAutocompleteProjection row : rows) {
            if (row == null || row.getCategoryName() == null || row.getCategoryName().isBlank()) {
                continue;
            }

            String keyword = extractLeafCategory(row.getCategoryName());

            if (keyword.isBlank()) {
                continue;
            }

            if (!keyword.contains(prefix)) {
                continue;
            }

            double score = toDouble(row.getScore());

            SearchAutocompleteItemDto current = merged.get(keyword);

            if (current == null || current.getScore() < score) {
                merged.put(keyword, SearchAutocompleteItemDto.builder()
                        .keyword(keyword)
                        .type(AutocompleteType.CATEGORY)
                        .score(score)
                        .placeId(null)
                        .build());
            }
        }

        return merged.values().stream()
                .sorted(Comparator.comparing(SearchAutocompleteItemDto::getScore).reversed()
                        .thenComparing(SearchAutocompleteItemDto::getKeyword))
                .limit(limit)
                .toList();
    }

    @Override
    public List<SearchAutocompleteItemDto> findPlaceCandidates(String prefix, int limit) {
        if (prefix == null || prefix.isBlank() || limit <= 0) {
            return List.of();
        }

        List<PlaceAutocompleteRepository.PlaceAutocompleteProjection> rows =
                placeAutocompleteRepository.findPlaceAutocompleteCandidates(prefix, limit);

        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        return rows.stream()
                .filter(row -> row != null && row.getKeyword() != null && !row.getKeyword().isBlank())
                .map(row -> SearchAutocompleteItemDto.builder()
                        .keyword(row.getKeyword())
                        .type(AutocompleteType.PLACE)
                        .score(toDouble(row.getScore()))
                        .placeId(row.getPlaceId())
                        .build())
                .toList();
    }

    private String extractLeafCategory(String categoryName) {
        String[] parts = categoryName.split(">");

        if (parts.length == 0) {
            return categoryName.trim();
        }

        return parts[parts.length - 1].trim();
    }

    private double toDouble(Number value) {
        return value == null ? 0D : value.doubleValue();
    }
}
