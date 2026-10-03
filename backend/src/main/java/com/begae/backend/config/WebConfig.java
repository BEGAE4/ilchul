package com.begae.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final com.begae.backend.place.component.RecommendationInterceptor recommendationInterceptor;
    public WebConfig(com.begae.backend.place.component.RecommendationInterceptor recommendationInterceptor) {
        this.recommendationInterceptor = recommendationInterceptor;
    }
    @Override public void addInterceptors(org.springframework.web.servlet.config.annotation.InterceptorRegistry registry) {
        registry.addInterceptor(recommendationInterceptor).addPathPatterns("/api/place/recommend");
    }
}
