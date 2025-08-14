package com.begae.backend.user.jwt;

import com.begae.backend.redis.domain.RefreshToken;
import com.begae.backend.redis.repository.RefreshTokenRedisRepository;
import com.begae.backend.user.auth.OauthUserDetails;
import com.begae.backend.user.dto.JwtDto;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.util.*;

@Component
public class JwtManager {

    private static final String AUTH_KEY = "AUTHORITY";
    private static final String AUTH_EMAIL = "EMAIL";

    private final RefreshTokenRedisRepository refreshTokenRedisRepository;

    private final String secret;

    @Getter
    private final long accessTokenValidityTime;
    @Getter
    private final long refreshTokenValidityTime;

    private SecretKey secretKey;

    public JwtManager(@Value("${spring.jwt.secret}") String secret,
                      @Value("${spring.jwt.access-token-validity-in-seconds}") long accessTokenVaildityTime,
                      @Value("${spring.jwt.refresh-token-validity-in-seconds}") long refreshTokenValidityTime,
                      RefreshTokenRedisRepository refreshTokenRedisRepository) {
        this.secret = secret;
        this.accessTokenValidityTime = accessTokenVaildityTime * 1000;
        this.refreshTokenValidityTime = refreshTokenValidityTime * 1000;
        this.refreshTokenRedisRepository = refreshTokenRedisRepository;
    } // 시크릿 키와 만료시간 주입

    @PostConstruct
    public void initKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    } // JWT 생성에 사용될 키 값 생성

    public JwtDto createToken(String email, String role) {
        long now = (new Date()).getTime();

        Date accessValidity = new Date(now + this.accessTokenValidityTime);
        Date refreshValidity = new Date(now + this.refreshTokenValidityTime);

        Map<String, String> map = new HashMap<>();
        map.put(AUTH_EMAIL, email);
        map.put(AUTH_KEY, role);

        String accessToken = Jwts.builder()
                .claims(map)
                .signWith(secretKey)
                .expiration(accessValidity)
                .compact();

        String refreshToken = Jwts.builder()
                .claims(map)
                .signWith(secretKey)
                .expiration(refreshValidity)
                .compact();

        return JwtDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    } // 토큰 생성 메서드

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException | MalformedJwtException | IllegalArgumentException | UnsupportedJwtException e) {
            return false;
        }
    } // 토큰 유효 검사

    public boolean validateExpired(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            return false;
        }
    } // 토큰 만료 검사

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        List<String> authorities = Arrays.asList(claims.get(AUTH_KEY)
                .toString()
                .split(","));

        List<? extends GrantedAuthority> simpleGrantedAuthorities = authorities.stream()
                .map(auth -> new SimpleGrantedAuthority(auth))
                .toList();

        OauthUserDetails principal = new OauthUserDetails(
                (String) claims.get(AUTH_EMAIL), simpleGrantedAuthorities, Map.of()
        );

        return new UsernamePasswordAuthenticationToken(principal, token, simpleGrantedAuthorities);
    } // 토큰으로부터 Authentication 객체를 만드는 메서드

    @Transactional
    public JwtDto reissueAccessToken(String refreshToken) {
        RefreshToken availableToken = refreshTokenRedisRepository.findByRefreshToken(refreshToken);

        JwtDto jwtDto = createToken(availableToken.getId(), availableToken.getAuthority());
        refreshTokenRedisRepository.save(RefreshToken.builder()
                .id(availableToken.getId())
                .authorities(availableToken.getAuthorities())
                .refreshToken(jwtDto.getRefreshToken())
                .build());

        return jwtDto;

    } // 리프레시 토큰을 검사하고 토큰을 새로 재발급

}
