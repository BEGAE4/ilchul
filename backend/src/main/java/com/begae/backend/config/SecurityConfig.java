package com.begae.backend.config;

import com.begae.backend.user.filter.JwtFilter;
import com.begae.backend.user.handler.JwtAccessDeniedHandler;
import com.begae.backend.user.handler.JwtAuthenticationFailEntryPoint;
import com.begae.backend.user.oauth2.CustomOauth2SuccessHandler;
import com.begae.backend.user.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService kakaoUserDetailsService;
    private final CustomOauth2SuccessHandler customOauth2SuccessHandler;
//    private final JwtFilter jwtFilter;
    private final JwtAuthenticationFailEntryPoint jwtAuthenticationFailEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain (HttpSecurity http) throws Exception {
        return http
                .csrf((auth) -> auth.disable())
                .authorizeHttpRequests((auth) -> auth.anyRequest().permitAll())
                .oauth2Login((oauth2) -> oauth2
                        .userInfoEndpoint(userInfoEndpointConfig ->
                                userInfoEndpointConfig.userService(kakaoUserDetailsService))
                        .successHandler(customOauth2SuccessHandler))
//                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(handling -> {
                    handling.authenticationEntryPoint(jwtAuthenticationFailEntryPoint);
                    handling.accessDeniedHandler(jwtAccessDeniedHandler);
                })
                .build();
    }



}
