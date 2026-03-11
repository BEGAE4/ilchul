package com.begae.backend.redis.repository;

import com.begae.backend.plan_place.cache.PlanDraft;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PlanDraftRedisRepository {

    private static final Duration TTL = Duration.ofMinutes(20);

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    private String key(long userId, String draftId) {
        return "plan:draft:" + userId + ":" + draftId;
    }

    public void save(PlanDraft draft) {
        try {
            String k = key(draft.getUserId(), draft.getDraftId());
            String v = objectMapper.writeValueAsString(draft);
            redis.opsForValue().set(k, v, TTL); // overwrite + TTL 갱신
        } catch (Exception e) {
            throw new RuntimeException("Failed to save draft", e);
        }
    }

    public Optional<PlanDraft> find(long userId, String draftId) {
        try {
            String v = redis.opsForValue().get(key(userId, draftId));
            if (v == null) return Optional.empty();
            return Optional.of(objectMapper.readValue(v, PlanDraft.class));
        } catch (Exception e) {
            throw new RuntimeException("Failed to read draft", e);
        }
    }

    public void delete(long userId, String draftId) {
        redis.delete(key(userId, draftId));
    }
}
