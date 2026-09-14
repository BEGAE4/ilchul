package com.begae.backend.storage.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.List;

/**
 * 저장소 파일 삭제는 DB 트랜잭션처럼 되돌릴 수 없으므로 트랜잭션 결과에 맞춰 실행한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ImageFileCleaner {

    private final ImageStorageService imageStorageService;

    /** 트랜잭션이 커밋된 뒤에만 파일을 지운다. 롤백되면 파일을 남긴다. */
    public void deleteAfterCommit(Collection<String> imageKeys) {
        List<String> keys = imageKeys.stream()
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
        if (keys.isEmpty()) {
            return;
        }

        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            keys.forEach(this::deleteQuietly);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                keys.forEach(ImageFileCleaner.this::deleteQuietly);
            }
        });
    }

    /** 트랜잭션이 롤백되면 이번에 올린 파일을 지운다. */
    public void deleteIfRolledBack(String imageKey) {
        if (!StringUtils.hasText(imageKey) || !TransactionSynchronizationManager.isSynchronizationActive()) {
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_ROLLED_BACK) {
                    deleteQuietly(imageKey);
                }
            }
        });
    }

    private void deleteQuietly(String imageKey) {
        try {
            imageStorageService.delete(imageKey);
        } catch (RuntimeException e) {
            log.warn("이미지 파일 삭제 실패 imageKey={}", imageKey, e);
        }
    }
}
