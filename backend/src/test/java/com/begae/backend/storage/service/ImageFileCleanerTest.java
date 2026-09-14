package com.begae.backend.storage.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionSynchronizationUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class ImageFileCleanerTest {

    private final ImageStorageService imageStorageService = mock(ImageStorageService.class);
    private final ImageFileCleaner cleaner = new ImageFileCleaner(imageStorageService);

    @BeforeEach
    void beginTransaction() {
        TransactionSynchronizationManager.initSynchronization();
    }

    @AfterEach
    void endTransaction() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void 커밋되기_전에는_파일을_지우지_않고_커밋된_뒤에_지운다() {
        cleaner.deleteAfterCommit(List.of("plan/1/image/a.png"));

        verify(imageStorageService, never()).delete(anyString());

        TransactionSynchronizationUtils.triggerAfterCommit();

        verify(imageStorageService).delete("plan/1/image/a.png");
    }

    @Test
    void 롤백되면_커밋_후_삭제_예약한_파일을_남긴다() {
        cleaner.deleteAfterCommit(List.of("plan/1/image/a.png"));

        rollback();

        verify(imageStorageService, never()).delete(anyString());
    }

    @Test
    void 롤백되면_이번에_올린_파일을_지운다() {
        cleaner.deleteIfRolledBack("planPlace/1/image/new.png");

        rollback();

        verify(imageStorageService).delete("planPlace/1/image/new.png");
    }

    @Test
    void 커밋되면_이번에_올린_파일을_남긴다() {
        cleaner.deleteIfRolledBack("planPlace/1/image/new.png");

        TransactionSynchronizationUtils.triggerAfterCommit();
        TransactionSynchronizationUtils.invokeAfterCompletion(
                TransactionSynchronizationManager.getSynchronizations(), TransactionSynchronization.STATUS_COMMITTED);

        verify(imageStorageService, never()).delete(anyString());
    }

    @Test
    void 커밋_후_파일_삭제가_실패해도_예외를_던지지_않고_나머지를_지운다() {
        doThrow(new RuntimeException("storage down")).when(imageStorageService).delete("plan/1/image/a.png");
        cleaner.deleteAfterCommit(List.of("plan/1/image/a.png", "plan/1/image/b.png"));

        assertThatCode(TransactionSynchronizationUtils::triggerAfterCommit).doesNotThrowAnyException();

        verify(imageStorageService).delete("plan/1/image/b.png");
    }

    private void rollback() {
        TransactionSynchronizationUtils.invokeAfterCompletion(
                TransactionSynchronizationManager.getSynchronizations(), TransactionSynchronization.STATUS_ROLLED_BACK);
    }
}
