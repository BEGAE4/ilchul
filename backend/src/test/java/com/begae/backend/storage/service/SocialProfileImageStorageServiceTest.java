package com.begae.backend.storage.service;

import org.junit.jupiter.api.Test;

import java.net.URI;

import static org.assertj.core.api.Assertions.assertThat;

class SocialProfileImageStorageServiceTest {

    @Test
    void 카카오가_http로_준_프로필_주소는_https로_받는다() {
        assertThat(SocialProfileImageStorageService.resolveDownloadUri("http://img1.kakaocdn.net/thumb/R640x640/img.jpg"))
                .contains(URI.create("https://img1.kakaocdn.net/thumb/R640x640/img.jpg"));
    }

    @Test
    void https_프로필_주소는_그대로_받는다() {
        assertThat(SocialProfileImageStorageService.resolveDownloadUri("https://ssl.pstatic.net/static/pwe/address/img_profile.png"))
                .contains(URI.create("https://ssl.pstatic.net/static/pwe/address/img_profile.png"));
    }

    @Test
    void 웹_주소가_아니거나_형식이_잘못되면_받지_않는다() {
        assertThat(SocialProfileImageStorageService.resolveDownloadUri("file:///etc/passwd")).isEmpty();
        assertThat(SocialProfileImageStorageService.resolveDownloadUri("http://bad host/img.jpg")).isEmpty();
        assertThat(SocialProfileImageStorageService.resolveDownloadUri(" ")).isEmpty();
    }
}
