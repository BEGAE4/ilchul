package com.begae.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@EnableRedisRepositories
@Configuration
public class RedisConfig {
    @Value("${spring.data.redis.host}")
    private String host;

    @Value("${spring.data.redis.port}")
    private int port;

    @Bean
    public LettuceConnectionFactory redisConnectinFactory() {
        // Lettuce(Redis와 연결시켜주는 라이브러리)
        // Redis 연결 관리 객체 생성
        // Redis 서버에 대한 정보를 설정한다.
        return new LettuceConnectionFactory(host, port);
    }
}
