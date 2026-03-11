package com.begae.backend.place.service;

import com.begae.backend.place.dto.SearchLog;
import com.begae.backend.place.dto.SearchLogDeleteRequest;
import com.begae.backend.place.dto.SearchLogSaveRequest;
import com.begae.backend.place.exception.SearchLogNotExistException;
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

    private final RedisTemplate<String, SearchLog> redisTemplate;
    private final UserRepository userRepository;

    @Override
    public void saveRecentSearchLog(Integer userId, SearchLogSaveRequest request) {
        log.info("saving SearchLog : {}", request.getName());

        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        String now = LocalDateTime.now().toString();
        String key = "SearchLog" + user.getUserId();

        List<SearchLog> logs = redisTemplate.opsForList().range(key, 0, -1);
        if (logs != null) {
            for (SearchLog log : logs) {
                if (log.getName().equals(request.getName())) {
                    redisTemplate.opsForList().remove(key, 1, log);
                    break;
                }
            }
        }

        SearchLog value = SearchLog.builder()
                .name(request.getName())
                .createdAt(now)
                .build();

        Long size = redisTemplate.opsForList().size(key);
        if (size != null && size == 10) {
            // rightPop을 통해 가장 오래된 데이터 삭제
            redisTemplate.opsForList().rightPop(key);
        }

        redisTemplate.opsForList().leftPush(key, value);
    }

    @Override
    public List<SearchLog> findRecentSearchLogs(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        String key = "SearchLog" + user.getUserId();
        List<SearchLog> logs = redisTemplate.opsForList().
                range(key, 0, -1);

        return logs;
    }

    @Override
    public void deleteRecentSearchLog(Integer userId, SearchLogDeleteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        String key = "SearchLog" + user.getUserId();
        SearchLog value = SearchLog.builder()
                .name(request.getName())
                .createdAt(request.getCreatedAt())
                .build();

        long count = redisTemplate.opsForList().remove(key, 1, value);

        if (count == 0) {
            throw new SearchLogNotExistException();
        }
    }
}
