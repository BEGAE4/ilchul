package com.begae.backend.plan_place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.domain.PlanPlaceImage;
import com.begae.backend.plan_place.dto.StampPlanPlaceRequestDto;
import com.begae.backend.plan_place.exception.PlanPlaceErrorCode;
import com.begae.backend.plan_place.repository.PlanPlaceImageRepository;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import com.begae.backend.storage.dto.StoredImage;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionSynchronizationUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class PlanPlaceServiceImplStampTest {

    private static final double PLACE_X = 126.9707;
    private static final double PLACE_Y = 37.5547;
    private static final String NEW_KEY = "planPlace/7/image/new.png";

    private final PlanPlaceRepository planPlaceRepository = mock(PlanPlaceRepository.class);
    private final PlanPlaceImageRepository planPlaceImageRepository = mock(PlanPlaceImageRepository.class);
    private final ImageStorageService imageStorageService = mock(ImageStorageService.class);
    private PlanPlaceServiceImpl service;
    private PlanPlace planPlace;

    @BeforeEach
    void setUp() {
        service = new PlanPlaceServiceImpl(
                planPlaceRepository,
                mock(PlanRepository.class),
                mock(PlaceRepository.class),
                planPlaceImageRepository,
                mock(PlanService.class),
                imageStorageService,
                new ImageFileCleaner(imageStorageService),
                mock(WebClient.class),
                mock(WebClient.class)
        );
        planPlace = PlanPlace.builder()
                .planPlaceId(7)
                .isStamped(false)
                .snapshotX(PLACE_X)
                .snapshotY(PLACE_Y)
                .build();
        when(planPlaceRepository.findByPlanPlaceIdAndPlan_User_UserId(7, 1)).thenReturn(Optional.of(planPlace));
        when(imageStorageService.upload(any(), eq("planPlace/7/image")))
                .thenReturn(new StoredImage(NEW_KEY, "https://s3.example.com/ilchul/" + NEW_KEY, "a.png", "image/png", 3L));
        when(planPlaceImageRepository.save(any(PlanPlaceImage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        TransactionSynchronizationManager.initSynchronization();
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clearSynchronization();
    }

    @Test
    void 스탬프_범위_밖이면_저장소의_파일을_올리거나_지우지_않는다() {
        addExistingImage("planPlace/7/image/old.png");

        assertThatThrownBy(() -> service.stampPlanPlace(1, 7, requestAt(PLACE_X + 0.01, PLACE_Y)))
                .isInstanceOf(CustomException.class)
                .extracting("errorCode").isEqualTo(PlanPlaceErrorCode.OUT_OF_STAMP_RANGE);
        rollback();

        verifyNoInteractions(imageStorageService);
    }

    @Test
    void 기존_사진은_커밋된_뒤에만_지운다() {
        addExistingImage("planPlace/7/image/old.png");

        service.stampPlanPlace(1, 7, requestAt(PLACE_X, PLACE_Y));

        verify(imageStorageService, never()).delete(anyString());
        TransactionSynchronizationUtils.triggerAfterCommit();
        verify(imageStorageService).delete("planPlace/7/image/old.png");
    }

    @Test
    void 저장_중에_롤백되면_새로_올린_파일만_지우고_기존_사진은_남긴다() {
        addExistingImage("planPlace/7/image/old.png");
        when(planPlaceImageRepository.save(any(PlanPlaceImage.class))).thenThrow(new IllegalStateException("db down"));

        assertThatThrownBy(() -> service.stampPlanPlace(1, 7, requestAt(PLACE_X, PLACE_Y)))
                .isInstanceOf(IllegalStateException.class);
        rollback();

        verify(imageStorageService).delete(NEW_KEY);
        verify(imageStorageService, never()).delete("planPlace/7/image/old.png");
    }

    @Test
    void 복제로_다른_장소와_공유된_사진_파일은_지우지_않는다() {
        String sharedKey = "planPlace/1/image/original.png";
        addExistingImage(sharedKey);
        when(planPlaceImageRepository.existsByImageKeyAndPlanPlaceNot(sharedKey, planPlace)).thenReturn(true);

        service.stampPlanPlace(1, 7, requestAt(PLACE_X, PLACE_Y));
        TransactionSynchronizationUtils.triggerAfterCommit();

        verify(imageStorageService, never()).delete(sharedKey);
    }

    private void addExistingImage(String imageKey) {
        planPlace.getPlanPlaceImages().add(PlanPlaceImage.builder().imageKey(imageKey).planPlace(planPlace).build());
    }

    private StampPlanPlaceRequestDto requestAt(double x, double y) {
        StampPlanPlaceRequestDto.Location location = new StampPlanPlaceRequestDto.Location();
        location.setX(x);
        location.setY(y);
        StampPlanPlaceRequestDto request = new StampPlanPlaceRequestDto();
        request.setImage(new MockMultipartFile("image", "a.png", "image/png", new byte[]{1, 2, 3}));
        request.setLocation(location);
        return request;
    }

    private void rollback() {
        TransactionSynchronizationUtils.invokeAfterCompletion(
                TransactionSynchronizationManager.getSynchronizations(), TransactionSynchronization.STATUS_ROLLED_BACK);
    }
}
