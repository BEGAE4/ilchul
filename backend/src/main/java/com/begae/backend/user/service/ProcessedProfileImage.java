package com.begae.backend.user.service;

public record ProcessedProfileImage(byte[] bytes, String originalFilename, String contentType) {
}
