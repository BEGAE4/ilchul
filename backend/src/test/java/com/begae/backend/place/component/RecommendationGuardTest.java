package com.begae.backend.place.component;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.exception.PlaceErrorCode;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.util.ArrayList;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RecommendationGuardTest {
    @Test void slotsAreBoundedAndReleasedOnceEvenWhenRedisFailsOnRelease() {
        var redis = mock(StringRedisTemplate.class);
        when(redis.execute(any(org.springframework.data.redis.core.script.RedisScript.class), anyList(), any(Object[].class)))
                .thenReturn(1L);
        var guard = new RecommendationGuard(redis);
        var leases = new ArrayList<RecommendationGuard.Lease>();
        for (int i = 0; i < 4; i++) leases.add(guard.acquire(i));
        assertThatThrownBy(() -> guard.acquire(5)).isInstanceOfSatisfying(CustomException.class,
                e -> assertThat(e.getErrorCode()).isEqualTo(PlaceErrorCode.RECOMMENDATION_LIMITED));
        when(redis.execute(any(org.springframework.data.redis.core.script.RedisScript.class), anyList(), any(Object[].class)))
                .thenThrow(new IllegalStateException("release unavailable")).thenReturn(1L);
        leases.getFirst().close(); leases.getFirst().close();
        var replacement = guard.acquire(5);
        assertThatThrownBy(() -> guard.acquire(6)).isInstanceOf(CustomException.class);
        replacement.close(); leases.forEach(RecommendationGuard.Lease::close);
    }
    @Test void deniedQuotaAndUnavailableRedisReleaseTheProcessSlot() {
        var redis = mock(StringRedisTemplate.class);
        when(redis.execute(any(org.springframework.data.redis.core.script.RedisScript.class), anyList(), any(Object[].class)))
                .thenReturn(0L).thenThrow(new IllegalStateException("unavailable")).thenReturn(1L);
        var guard = new RecommendationGuard(redis);
        assertThatThrownBy(() -> guard.acquire(1)).isInstanceOfSatisfying(CustomException.class,
                e -> assertThat(e.getErrorCode()).isEqualTo(PlaceErrorCode.RECOMMENDATION_LIMITED));
        assertThatThrownBy(() -> guard.acquire(1)).isInstanceOfSatisfying(CustomException.class,
                e -> assertThat(e.getErrorCode()).isEqualTo(PlaceErrorCode.RECOMMENDATION_SERVICE_UNAVAILABLE));
        guard.acquire(1).close();
    }
}
