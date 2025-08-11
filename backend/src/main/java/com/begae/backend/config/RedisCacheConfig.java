package com.begae.backend.config;

import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
public class RedisCacheConfig {
    @Bean
    public CacheManager boardCacheManager(RedisConnectionFactory redisConnectionFactory) {
        /*
            CacheManeger
            Spring에서 캐시를 관리하는 핵심 인터페이스.
            → @Cacheable, @CachePut, @CacheEvict 같은 어노테이션이 동작할 때 이 CacheManager를 통해 캐시를 저장/조회.

            RedisConnectionFactory
            Redis 서버와의 연결을 제공하는 팩토리.
         */
        RedisCacheConfiguration redisCacheConfiguration = RedisCacheConfiguration // Redis 캐시 동작 방식(직렬화 방식, TTL 등)을 정의하는 클래스.
                .defaultCacheConfig() // 기본 설정을 불러옴. → 이후 체이닝으로 필요한 설정을 덮어씀.

                // Redis는 기본적으로 바이트 배열로 데이터를 저장하기 때문에, 직렬화 방식을 지정해야 함.
                .serializeKeysWith(RedisSerializationContext // 캐시의 Key를 어떻게 직렬화할지 설정.
                        .SerializationPair
                        .fromSerializer(new StringRedisSerializer())) // 키를 UTF-8 문자열로 직렬화.
                .serializeValuesWith(RedisSerializationContext // 캐시의 Value 직렬화 방식 설정.
                        .SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer())) // 값을 JSON으로 직렬화/역직렬화.
                .entryTtl(Duration.ofMinutes(1L)); // 캐시 데이터의 TTL(Time To Live) → 즉, 만료 시간 설정.

        return RedisCacheManager.RedisCacheManagerBuilder // CacheManager 빌더
                .fromConnectionFactory(redisConnectionFactory) // 연결정보 설정
                .cacheDefaults(redisCacheConfiguration) // 기본 캐시 설정 적용(직렬화 방식, TTL, Null 허용 여부 등)
                .build();
    }
}
