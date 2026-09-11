package com.begae.backend.user.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "유저프로필", description = "유저프로필 관련 API")
@Validated
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {


}
