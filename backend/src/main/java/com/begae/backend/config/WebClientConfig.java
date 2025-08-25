package com.begae.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${kakao.rest-api-key}")
    private String KAKAO_API_KEY;

    @Value("${google.rest-api-key}")
    private String GOOGLE_API_KEY;

    @Bean("kakaoWebClient")
    public WebClient kakaoWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl("https://dapi.kakao.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "KakaoAK " + KAKAO_API_KEY)
                .codecs(clientCodecConfigurer ->
                        clientCodecConfigurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .clientConnector(new ReactorClientHttpConnector(HttpClient.create().responseTimeout(Duration.ofMinutes(5))))
                .build();
    }

    @Bean("googleWebClient")
    public WebClient googleWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl("https://places.googleapis.com")
                .defaultHeader("X-Goog-Api-Key", GOOGLE_API_KEY)
                .codecs(clientCodecConfigurer ->
                        clientCodecConfigurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .clientConnector(new ReactorClientHttpConnector(HttpClient.create().responseTimeout(Duration.ofMinutes(5))))
                .build();
    }
}
