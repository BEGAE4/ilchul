package com.begae.backend.place.service;

import com.begae.backend.place.dto.PopularSearchKeywordDto;
import com.begae.backend.place.util.SearchKeywordPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PopularSearchService {

    private static final int POPULAR_LIMIT = 5;

    private final StringRedisTemplate stringRedisTemplate;
    private final SearchKeywordPolicy searchKeywordPolicy;

    public void record(Integer userId, String rawKeyword) {
        String keyword = searchKeywordPolicy.normalize(rawKeyword);

        if (userId == null || !searchKeywordPolicy.isRecordable(keyword)) {
            return;
        }

        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.now();

        String dedupeKey = getDedupeKey(today);
        String popularKey = getMonthlyPopularKey(currentMonth);
        String dedupeMember = userId + ":" + hash(keyword);

        Long addedCount = stringRedisTemplate.opsForSet()
                .add(dedupeKey, dedupeMember);

        stringRedisTemplate.expire(dedupeKey, Duration.ofDays(2));

        if (addedCount != null && addedCount == 1L) {
            stringRedisTemplate.opsForZSet()
                    .incrementScore(popularKey, keyword, 1D);

            stringRedisTemplate.expire(popularKey, Duration.ofDays(400));
        }
    }

    public List<PopularSearchKeywordDto> findMonthlyTopKeywords() {
        String popularKey = getMonthlyPopularKey(YearMonth.now());

        Set<ZSetOperations.TypedTuple<String>> tuples = stringRedisTemplate.opsForZSet()
                .reverseRangeWithScores(popularKey, 0, POPULAR_LIMIT - 1);

        if (tuples == null || tuples.isEmpty()) {
            return List.of();
        }

        List<PopularSearchKeywordDto> result = new ArrayList<>();
        int ranking = 1;

        for (ZSetOperations.TypedTuple<String> tuple : tuples) {
            if (tuple.getValue() == null) {
                continue;
            }

            result.add(PopularSearchKeywordDto.builder()
                    .ranking(ranking++)
                    .keyword(tuple.getValue())
                    .score(tuple.getScore() == null ? 0D : tuple.getScore())
                    .build());
        }

        return result;
    }

    private String getDedupeKey(LocalDate date) {
        return "search:popular:dedupe:" + date.format(DateTimeFormatter.BASIC_ISO_DATE);
    }

    private String getMonthlyPopularKey(YearMonth yearMonth) {
        return "search:popular:monthly:" + yearMonth.format(DateTimeFormatter.ofPattern("yyyyMM"));
    }

    private String hash(String keyword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(keyword.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encoded);
        } catch (Exception e) {
            throw new IllegalStateException("검색어 해시 생성에 실패했습니다.", e);
        }
    }
}
