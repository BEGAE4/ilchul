package com.begae.backend.user.dto;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public record SignUserInfoResponseDto(
        Integer userId,
        String email,
        Collection<? extends GrantedAuthority> role
) {
}
