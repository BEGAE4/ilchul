package com.begae.backend.global.security.jwt;

import com.begae.backend.redis.domain.RefreshToken;
import com.begae.backend.redis.repository.RefreshTokenRedisRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtManagerTest {

    private static final String TEST_SECRET = "dGVzdC1qd3Qtc2VjcmV0LXRlc3Qtand0LXNlY3JldC0xMjM0NTY=";

    @Mock
    private RefreshTokenRedisRepository refreshTokenRedisRepository;

    @Test
    void reissueReturnsEmptyWhenRefreshTokenIsMissing() {
        JwtManager jwtManager = new JwtManager(TEST_SECRET, 1800, 86400, refreshTokenRedisRepository);
        when(refreshTokenRedisRepository.findByRefreshToken("missing-token")).thenReturn(Optional.empty());

        Optional<JwtDto> result = jwtManager.reissueAccessToken("missing-token");

        assertThat(result).isEmpty();
        verify(refreshTokenRedisRepository, never()).save(org.mockito.ArgumentMatchers.any(RefreshToken.class));
    }
}
