package com.begae.backend.place.service;

import com.begae.backend.place.dto.SearchLog;
import com.begae.backend.place.dto.SearchLogDeleteRequest;
import com.begae.backend.place.dto.SearchLogSaveRequest;
import com.begae.backend.place.exception.SearchLogNotExistException;
import com.begae.backend.place.util.SearchKeywordPolicy;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserNotFoundException;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SearchLogServiceImpl implements SearchLogService {

    private static final int RECENT_SEARCH_LOG_LIMIT = 10;

    private final RedisTemplate<String, SearchLog> redisTemplate;
    private final UserRepository userRepository;
    private final SearchKeywordPolicy searchKeywordPolicy;
    private final PopularSearchService popularSearchService;
    private final SearchAutocompleteService searchAutocompleteService;

    @Override
    public void saveRecentSearchLog(Integer userId, SearchLogSaveRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        String keyword = searchKeywordPolicy.normalize(request.getName());

        if (!searchKeywordPolicy.isRecordable(keyword)) {
            log.debug("검색어 정책에 의해 제외됨: {}", keyword);
            return;
        }

        log.info("saving SearchLog : {}", keyword);

        String now = LocalDateTime.now().toString();
        String key = getRecentSearchLogKey(user.getUserId());

        List<SearchLog> logs = redisTemplate.opsForList()
                .range(key, 0, -1);

        if (logs != null) {
            for (SearchLog log : logs) {
                if (log != null && keyword.equals(log.getName())) {
                    redisTemplate.opsForList().remove(key, 1, log);
                    break;
                }
            }
        }

        SearchLog value = SearchLog.builder()
                .name(keyword)
                .createdAt(now)
                .build();

        Long size = redisTemplate.opsForList()
                .size(key);

        if (size != null && size >= RECENT_SEARCH_LOG_LIMIT) {
            redisTemplate.opsForList()
                    .rightPop(key);
        }

        redisTemplate.opsForList()
                .leftPush(key, value);

        popularSearchService.record(user.getUserId(), keyword);
        searchAutocompleteService.recordPopularAutocompleteKeyword(keyword);
    }

    @Override
    public List<SearchLog> findRecentSearchLogs(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        String key = getRecentSearchLogKey(user.getUserId());

        List<SearchLog> logs = redisTemplate.opsForList()
                .range(key, 0, -1);

        return logs == null ? List.of() : logs;
    }

    @Override
    public void deleteRecentSearchLog(Integer userId, SearchLogDeleteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        String key = getRecentSearchLogKey(user.getUserId());

        SearchLog value = SearchLog.builder()
                .name(searchKeywordPolicy.normalize(request.getName()))
                .createdAt(request.getCreatedAt())
                .build();

        long count = redisTemplate.opsForList()
                .remove(key, 1, value);

        if (count == 0) {
            throw new SearchLogNotExistException();
        }
    }

    private String getRecentSearchLogKey(Integer userId) {
        return "search:recent:user:" + userId;
    }
}