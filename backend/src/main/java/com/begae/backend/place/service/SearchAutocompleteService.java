package com.begae.backend.place.service;

import com.begae.backend.place.dto.AutocompleteType;
import com.begae.backend.place.dto.SearchAutocompleteItemDto;
import com.begae.backend.place.dto.SearchLog;
import com.begae.backend.place.util.CategoryPlaceAutocompleteProvider;
import com.begae.backend.place.util.SearchKeywordPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SearchAutocompleteService {

    private static final int MIN_PREFIX_LENGTH = 2;
    private static final int DEFAULT_LIMIT = 5;
    private static final int MAX_LIMIT = 5;

    private static final double USER_WEIGHT = 4_000_000D;
    private static final double POPULAR_WEIGHT = 3_000_000D;
    private static final double CATEGORY_WEIGHT = 2_000_000D;
    private static final double PLACE_WEIGHT = 1_000_000D;

    private final RedisTemplate<String, SearchLog> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;
    private final SearchKeywordPolicy searchKeywordPolicy;
    private final CategoryPlaceAutocompleteProvider categoryPlaceAutocompleteProvider;

    public List<SearchAutocompleteItemDto> autocomplete(Integer userId, String rawKeyword, Integer limit) {
        String prefix = searchKeywordPolicy.normalize(rawKeyword);

        if (prefix.length() < MIN_PREFIX_LENGTH) {
            return List.of();
        }

        int actualLimit = resolveLimit(limit);

        List<SearchAutocompleteItemDto> candidates = new ArrayList<>();

        candidates.addAll(findUserKeywordCandidates(userId, prefix, actualLimit));
        candidates.addAll(findPopularKeywordCandidates(prefix, actualLimit));

        candidates.addAll(addWeight(
                categoryPlaceAutocompleteProvider.findCategoryCandidates(prefix, actualLimit),
                CATEGORY_WEIGHT
        ));

        candidates.addAll(addWeight(
                categoryPlaceAutocompleteProvider.findPlaceCandidates(prefix, actualLimit),
                PLACE_WEIGHT
        ));

        return mergeAndLimit(candidates, actualLimit);
    }

    public void recordPopularAutocompleteKeyword(String rawKeyword) {
        String keyword = searchKeywordPolicy.normalize(rawKeyword);

        if (!searchKeywordPolicy.isRecordable(keyword)) {
            return;
        }

        for (String prefix : generatePrefixes(keyword)) {
            String key = getPopularAutocompleteKey(prefix);

            stringRedisTemplate.opsForZSet()
                    .incrementScore(key, keyword, 1D);

            stringRedisTemplate.expire(key, Duration.ofDays(400));
        }
    }

    private List<SearchAutocompleteItemDto> findUserKeywordCandidates(
            Integer userId,
            String prefix,
            int limit
    ) {
        if (userId == null) {
            return List.of();
        }

        String key = getRecentSearchLogKey(userId);

        List<SearchLog> logs = redisTemplate.opsForList()
                .range(key, 0, -1);

        if (logs == null || logs.isEmpty()) {
            return List.of();
        }

        List<SearchAutocompleteItemDto> result = new ArrayList<>();
        double orderScore = 1_000D;

        for (SearchLog log : logs) {
            if (log == null || log.getName() == null) {
                continue;
            }

            String keyword = searchKeywordPolicy.normalize(log.getName());

            if (keyword.startsWith(prefix)) {
                result.add(SearchAutocompleteItemDto.builder()
                        .keyword(keyword)
                        .type(AutocompleteType.USER_KEYWORD)
                        .score(USER_WEIGHT + orderScore)
                        .placeId(null)
                        .build());

                orderScore -= 1D;
            }

            if (result.size() >= limit) {
                break;
            }
        }

        return result;
    }

    private List<SearchAutocompleteItemDto> findPopularKeywordCandidates(String prefix, int limit) {
        String key = getPopularAutocompleteKey(prefix);

        Set<ZSetOperations.TypedTuple<String>> tuples = stringRedisTemplate.opsForZSet()
                .reverseRangeWithScores(key, 0, limit - 1);

        if (tuples == null || tuples.isEmpty()) {
            return List.of();
        }

        List<SearchAutocompleteItemDto> result = new ArrayList<>();

        for (ZSetOperations.TypedTuple<String> tuple : tuples) {
            if (tuple.getValue() == null) {
                continue;
            }

            result.add(SearchAutocompleteItemDto.builder()
                    .keyword(tuple.getValue())
                    .type(AutocompleteType.POPULAR_KEYWORD)
                    .score(POPULAR_WEIGHT + nullToZero(tuple.getScore()))
                    .placeId(null)
                    .build());
        }

        return result;
    }

    private List<SearchAutocompleteItemDto> addWeight(
            List<SearchAutocompleteItemDto> items,
            double weight
    ) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }

        return items.stream()
                .map(item -> SearchAutocompleteItemDto.builder()
                        .keyword(item.getKeyword())
                        .type(item.getType())
                        .score(weight + nullToZero(item.getScore()))
                        .placeId(item.getPlaceId())
                        .build())
                .toList();
    }

    private List<SearchAutocompleteItemDto> mergeAndLimit(
            List<SearchAutocompleteItemDto> candidates,
            int limit
    ) {
        if (candidates.isEmpty()) {
            return List.of();
        }

        Map<String, SearchAutocompleteItemDto> deduplicated = new LinkedHashMap<>();

        candidates.stream()
                .filter(item -> item.getKeyword() != null && !item.getKeyword().isBlank())
                .sorted(Comparator.comparing(SearchAutocompleteItemDto::getScore).reversed())
                .forEach(item -> {
                    String key = searchKeywordPolicy.normalize(item.getKeyword());
                    deduplicated.putIfAbsent(key, item);
                });

        return deduplicated.values().stream()
                .sorted(Comparator.comparing(SearchAutocompleteItemDto::getScore).reversed())
                .limit(limit)
                .toList();
    }

    private List<String> generatePrefixes(String keyword) {
        List<String> prefixes = new ArrayList<>();

        int maxLength = Math.min(keyword.length(), 10);

        for (int i = MIN_PREFIX_LENGTH; i <= maxLength; i++) {
            prefixes.add(keyword.substring(0, i));
        }

        return prefixes;
    }

    private int resolveLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }

        return Math.min(limit, MAX_LIMIT);
    }

    private String getRecentSearchLogKey(Integer userId) {
        return "search:recent:user:" + userId;
    }

    private String getPopularAutocompleteKey(String prefix) {
        return "search:autocomplete:popular:" + prefix;
    }

    private double nullToZero(Double value) {
        return value == null ? 0D : value;
    }
}
