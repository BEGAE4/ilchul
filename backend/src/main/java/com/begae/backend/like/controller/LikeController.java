package com.begae.backend.like.controller;

import com.begae.backend.like.dto.LikeResponseDto;
import com.begae.backend.like.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

//    @PostMapping("/{planId}")
//    public ResponseEntity<LikeResponseDto> toggleLike(@PathVariable Integer planId) {
//        return ResponseEntity.status(HttpStatus.OK).body(likeService.toggleLike(planId));
//    }
}
