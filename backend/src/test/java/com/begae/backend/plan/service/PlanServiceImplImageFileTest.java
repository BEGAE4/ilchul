package com.begae.backend.plan.service;

import com.begae.backend.like.repository.LikeRepository;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.PlanImage;
import com.begae.backend.plan.repository.PlanImageRepository;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.domain.PlanPlaceImage;
import com.begae.backend.plan_place.repository.PlanPlaceImageRepository;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import com.begae.backend.storage.dto.StoredImage;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionSynchronizationUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PlanServiceImplImageFileTest {

    private final PlanRepository planRepository = mock(PlanRepository.class);
    private final PlanImageRepository planImageRepository = mock(PlanImageRepository.class);
    private final PlanPlaceImageRepository planPlaceImageRepository = mock(PlanPlaceImageRepository.class);
    private final ImageStorageService imageStorageService = mock(ImageStorageService.class);
    private PlanServiceImpl service;
    private Plan plan;

    @BeforeEach
    void setUp() {
        service = new PlanServiceImpl(
                planRepository,
                mock(UserRepository.class),
                mock(PlaceRepository.class),
                mock(PlanPlaceRepository.class),
                mock(LikeRepository.class),
                mock(ScrappedPlanRepository.class),
                planImageRepository,
                imageStorageService,
                planPlaceImageRepository,
                new ImageFileCleaner(imageStorageService)
        );
        User owner = User.builder().userNickname("owner").build();
        ReflectionTestUtils.setField(owner, "userId", 1);
        plan = Plan.builder().planId(10).user(owner).build();
        when(planRepository.findById(10)).thenReturn(Optional.of(plan));
        TransactionSynchronizationManager.initSynchronization();
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clearSynchronization();
    }

    @Test
    void 플랜을_삭제하면_커밋된_뒤에_플랜_사진과_스탬프_사진_파일을_지운다() {
        plan.getPlanImages().add(PlanImage.builder().imageKey("plan/10/image/a.png").plan(plan).build());
        PlanPlace planPlace = PlanPlace.builder().plan(plan).build();
        planPlace.getPlanPlaceImages().add(PlanPlaceImage.builder().imageKey("planPlace/5/image/b.png").planPlace(planPlace).build());
        plan.getPlanPlaces().add(planPlace);

        service.deletePlan(1, 10);

        verify(planRepository).delete(plan);
        verify(imageStorageService, never()).delete(anyString());
        TransactionSynchronizationUtils.triggerAfterCommit();
        verify(imageStorageService).delete("plan/10/image/a.png");
        verify(imageStorageService).delete("planPlace/5/image/b.png");
    }

    @Test
    void 플랜을_삭제해도_다른_플랜과_공유된_스탬프_사진_파일은_남긴다() {
        PlanPlace planPlace = PlanPlace.builder().plan(plan).build();
        planPlace.getPlanPlaceImages().add(PlanPlaceImage.builder().imageKey("planPlace/1/image/original.png").planPlace(planPlace).build());
        plan.getPlanPlaces().add(planPlace);
        when(planPlaceImageRepository.existsByImageKeyAndPlanPlace_PlanNot("planPlace/1/image/original.png", plan)).thenReturn(true);

        service.deletePlan(1, 10);
        TransactionSynchronizationUtils.triggerAfterCommit();

        verify(imageStorageService, never()).delete(anyString());
    }

    @Test
    void 플랜_사진_삭제가_롤백되면_파일을_남긴다() {
        PlanImage image = PlanImage.builder().planImageId(3).imageKey("plan/10/image/a.png").plan(plan).build();
        when(planImageRepository.findByPlanImageIdAndPlan_PlanId(3, 10)).thenReturn(Optional.of(image));
        when(planRepository.findPlanDetailFlat(10)).thenReturn(List.of());

        assertThatThrownBy(() -> service.deleteImages(1, 10, List.of(3)));
        rollback();

        verify(planImageRepository).delete(image);
        verify(imageStorageService, never()).delete(anyString());
    }

    @Test
    void 플랜_사진_업로드가_롤백되면_올린_파일을_지운다() {
        MultipartFile file = new MockMultipartFile("images", "a.png", "image/png", new byte[]{1});
        when(imageStorageService.upload(any(), eq("plan/10/image")))
                .thenReturn(new StoredImage("plan/10/image/new.png", "https://s3.example.com/ilchul/plan/10/image/new.png", "a.png", "image/png", 1L));
        when(planImageRepository.save(any(PlanImage.class))).thenThrow(new IllegalStateException("db down"));

        assertThatThrownBy(() -> service.uploadImages(1, 10, List.of(file)));
        rollback();

        verify(imageStorageService).delete("plan/10/image/new.png");
    }

    private void rollback() {
        TransactionSynchronizationUtils.invokeAfterCompletion(
                TransactionSynchronizationManager.getSynchronizations(), TransactionSynchronization.STATUS_ROLLED_BACK);
    }
}
