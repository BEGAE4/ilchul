package com.begae.backend.place.component;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.exception.PlaceErrorCode;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Semaphore;

/** Redis quota and a per-account lease work across application instances; process slots bound local work. */
@Component
public class RecommendationGuard {
    private static final DefaultRedisScript<Long> ACQUIRE = new DefaultRedisScript<>("""
            if redis.call('EXISTS', KEYS[2]) == 1 then return 0 end
            local count = tonumber(redis.call('GET', KEYS[1]) or '0')
            if count >= 12 then return 0 end
            redis.call('SET', KEYS[2], ARGV[1], 'EX', 120)
            count = redis.call('INCR', KEYS[1])
            if count == 1 then redis.call('EXPIRE', KEYS[1], 3600) end
            return 1
            """, Long.class);
    private static final DefaultRedisScript<Long> RELEASE = new DefaultRedisScript<>("""
            if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end
            return 0
            """, Long.class);
    private final StringRedisTemplate redis;
    private final Semaphore slots = new Semaphore(4);
    public RecommendationGuard(StringRedisTemplate redis) { this.redis = redis; }

    public Lease acquire(int userId) {
        if (!slots.tryAcquire()) throw new CustomException(PlaceErrorCode.RECOMMENDATION_LIMITED);
        String token = UUID.randomUUID().toString();
        String prefix = "recommendation:{" + userId + "}:";
        try {
            Long result = redis.execute(ACQUIRE, List.of(prefix + "quota", prefix + "active"), token);
            if (!Long.valueOf(1).equals(result)) throw new CustomException(PlaceErrorCode.RECOMMENDATION_LIMITED);
            return new Lease(prefix + "active", token);
        } catch (RuntimeException exception) {
            slots.release();
            if (exception instanceof CustomException custom) throw custom;
            throw new CustomException(PlaceErrorCode.RECOMMENDATION_SERVICE_UNAVAILABLE);
        }
    }
    public final class Lease implements AutoCloseable {
        private final String key;
        private final String token;
        private boolean closed;
        private Lease(String key, String token) { this.key = key; this.token = token; }
        @Override public synchronized void close() {
            if (closed) return;
            closed = true;
            try { redis.execute(RELEASE, List.of(key), token); }
            catch (RuntimeException ignored) { /* Lease expires; never leak the local semaphore. */ }
            finally { slots.release(); }
        }
    }
}
