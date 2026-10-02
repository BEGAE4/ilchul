package com.begae.backend.plan_place.service;

import com.begae.backend.place.domain.Place;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.dto.DeparturePointDto;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.domain.PlanPlaceImage;
import com.begae.backend.plan_place.dto.UpdatePlanPlaceItemDto;
import com.begae.backend.plan_place.dto.UpdatePlanPlaceRequestDto;
import com.begae.backend.plan_place.dto.UpdatePlanPreviewResponseDto;
import com.begae.backend.plan_place.repository.PlanPlaceImageRepository;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import com.begae.backend.user.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:update-route;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER,VALUE",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class PlanPlaceServiceImplUpdateRouteTest {

    @Autowired
    private TestEntityManager entityManager;
    @Autowired
    private PlanRepository planRepository;
    @Autowired
    private PlaceRepository placeRepository;
    @Autowired
    private PlanPlaceRepository planPlaceRepository;
    @Autowired
    private PlanPlaceImageRepository planPlaceImageRepository;

    private final com.begae.backend.trip.TripRouteCalculator calculator = mock(com.begae.backend.trip.TripRouteCalculator.class);
    private final ImageFileCleaner imageFileCleaner = mock(ImageFileCleaner.class);
    private PlanPlaceServiceImpl service;

    private User owner;
    private Place stampedPlace;
    private Place newPlace;
    private Plan plan;
    private PlanPlace stampedStop;

    @BeforeEach
    void setUp() throws Exception {
        service = new PlanPlaceServiceImpl(
                planPlaceRepository,
                planRepository,
                placeRepository,
                planPlaceImageRepository,
                mock(PlanService.class),
                mock(ImageStorageService.class),
                imageFileCleaner,
                mock(WebClient.class),
                mock(WebClient.class),
                calculator
        );

        owner = entityManager.persist(User.builder().userNickname("owner").build());
        stampedPlace = entityManager.persist(Place.builder().placeName("서울역").x(126.97).y(37.55).build());
        newPlace = entityManager.persist(Place.builder().placeName("남산타워").x(126.98).y(37.55).build());
        plan = entityManager.persist(Plan.builder()
                .user(owner).planTitle("경로 수정").isVerified(false).isPlanVisible(true).likeCount(0).scrapCount(0)
                .build());
        stampedStop = entityManager.persist(PlanPlace.builder()
                .plan(plan).place(stampedPlace).orderIndex(1).isStamped(true)
                .snapshotPlaceName("서울역").snapshotX(126.97).snapshotY(37.55)
                .build());
        entityManager.persist(PlanPlaceImage.builder()
                .planPlace(stampedStop).imageKey("planPlace/1/image/stamp.png").build());
        entityManager.flush();
        entityManager.clear();

        org.mockito.Mockito.when(calculator.calculate(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyList(),
                org.mockito.ArgumentMatchers.anyList(), org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> {
                    List<com.begae.backend.plan_place.dto.Point> points = invocation.getArgument(1);
                    List<Integer> stays = invocation.getArgument(2);
                    int stay = stays.stream().mapToInt(Integer::intValue).sum();
                    return new com.begae.backend.trip.TripTimeSummary(points.stream().map(p -> 10).toList(), 10,
                            (points.size() + 1) * 10, stay, (points.size() + 1) * 10 + stay, 2, false);
                });
    }

    @Test
    void 경로를_수정해도_기존_장소의_스탬프_사진이_유지된다() {
        service.updatePlanPlace(owner.getUserId(), plan.getPlanId(), request(
                stop(stampedStop.getPlanPlaceId(), stampedPlace.getPlaceId(), 1),
                stop(null, newPlace.getPlaceId(), 2)
        ));
        entityManager.flush();
        entityManager.clear();

        List<PlanPlace> stops = planPlaceRepository.findByPlanOrderByOrderIndexAsc(entityManager.find(Plan.class, plan.getPlanId()));

        assertThat(stops).hasSize(2);
        assertThat(stops.getFirst().getIsStamped()).isTrue();
        assertThat(stops.getFirst().getPlanPlaceImages())
                .extracting(PlanPlaceImage::getImageKey)
                .containsExactly("planPlace/1/image/stamp.png");
    }

    @Test
    void 새_장소를_기존_장소보다_앞에_넣어도_요청한_장소로_저장된다() {
        service.updatePlanPlace(owner.getUserId(), plan.getPlanId(), request(
                stop(null, newPlace.getPlaceId(), 1),
                stop(stampedStop.getPlanPlaceId(), stampedPlace.getPlaceId(), 2)
        ));
        entityManager.flush();
        entityManager.clear();

        List<PlanPlace> stops = planPlaceRepository.findByPlanOrderByOrderIndexAsc(entityManager.find(Plan.class, plan.getPlanId()));

        assertThat(stops).extracting(stopPlace -> stopPlace.getPlace().getPlaceId())
                .containsExactly(newPlace.getPlaceId(), stampedPlace.getPlaceId());
    }

    @Test
    void 경로에서_뺀_장소의_스탬프_사진_파일은_커밋_후_삭제를_예약한다() {
        service.updatePlanPlace(owner.getUserId(), plan.getPlanId(), request(
                stop(null, newPlace.getPlaceId(), 1)
        ));
        entityManager.flush();
        entityManager.clear();

        List<PlanPlace> stops = planPlaceRepository.findByPlanOrderByOrderIndexAsc(entityManager.find(Plan.class, plan.getPlanId()));

        assertThat(stops).extracting(stopPlace -> stopPlace.getPlace().getPlaceId()).containsExactly(newPlace.getPlaceId());
        assertThat(planPlaceImageRepository.findAll()).isEmpty();
        verify(imageFileCleaner).deleteAfterCommit(List.of("planPlace/1/image/stamp.png"));
    }

    @Test
    void 경로_수정_미리보기도_새_장소를_요청한_장소로_보여준다() {
        UpdatePlanPreviewResponseDto preview = service.updatePlanPreview(owner.getUserId(), plan.getPlanId(), request(
                stop(null, newPlace.getPlaceId(), 1),
                stop(stampedStop.getPlanPlaceId(), stampedPlace.getPlaceId(), 2)
        ));

        assertThat(preview.getPlaces()).extracting(UpdatePlanPreviewResponseDto.PlanPlacePreview::getPlaceId)
                .containsExactly(newPlace.getPlaceId(), stampedPlace.getPlaceId());
    }

    private UpdatePlanPlaceRequestDto request(UpdatePlanPlaceItemDto... stops) {
        UpdatePlanPlaceRequestDto request = new UpdatePlanPlaceRequestDto();
        request.setDeparturePoint(new DeparturePointDto("출발지", "서울", 126.96, 37.55));
        request.setPlaces(new java.util.ArrayList<>(List.of(stops)));
        return request;
    }

    private UpdatePlanPlaceItemDto stop(Integer planPlaceId, Integer placeId, int order) {
        UpdatePlanPlaceItemDto item = new UpdatePlanPlaceItemDto();
        item.setPlanPlaceId(planPlaceId);
        item.setPlaceId(placeId);
        item.setOrder(order);
        return item;
    }
}
