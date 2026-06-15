package com.begae.backend.storage.dto;

public record StoredImage(String imageKey,
                          String imageUrl,
                          String originalFilename,
                          String contentType,
                          Long fileSize) {

}
