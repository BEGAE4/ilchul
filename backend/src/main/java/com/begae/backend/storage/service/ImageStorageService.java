package com.begae.backend.storage.service;

import com.begae.backend.storage.dto.StoredImage;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    StoredImage upload(MultipartFile file, String directory);

    default StoredImage uploadPrivate(MultipartFile file, String directory) {
        return upload(file, directory);
    }

    StoredImage uploadByUrl(byte[] bytes, String originalFilename, String contentType, String directory);

    void delete(String imageKey);

    String getAccessibleUrl(String imageKey);

    default byte[] download(String imageKey) {
        throw new UnsupportedOperationException("download is not implemented");
    }

}
