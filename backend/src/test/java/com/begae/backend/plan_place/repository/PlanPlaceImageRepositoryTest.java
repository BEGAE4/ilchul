package com.begae.backend.plan_place.repository;

import com.begae.backend.place.domain.Place;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.domain.PlanPlaceImage;
import com.begae.backend.user.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:plan-place-image-repository;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER,VALUE",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class PlanPlaceImageRepositoryTest {

    private static final String SHARED_KEY = "planPlace/1/image/original.png";

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PlanPlaceImageRepository planPlaceImageRepository;

    private Plan originalPlan;
    private PlanPlace originalPlace;
    private Plan copiedPlan;
    private PlanPlace copiedPlace;

    @BeforeEach
    void setUp() {
        User user = entityManager.persist(User.builder().userNickname("tester").build());
        Place place = entityManager.persist(Place.builder().placeName("서울역").build());
        originalPlan = persistPlan(user);
        originalPlace = persistPlanPlace(originalPlan, place);
        copiedPlan = persistPlan(user);
        copiedPlace = persistPlanPlace(copiedPlan, place);
    }

    @Test
    void 같은_파일을_다른_장소가_참조하는지_확인한다() {
        persistImage(originalPlace, SHARED_KEY);

        assertThat(planPlaceImageRepository.existsByImageKeyAndPlanPlaceNot(SHARED_KEY, copiedPlace)).isTrue();
        assertThat(planPlaceImageRepository.existsByImageKeyAndPlanPlaceNot(SHARED_KEY, originalPlace)).isFalse();
    }

    @Test
    void 같은_파일을_다른_플랜이_참조하는지_확인한다() {
        persistImage(originalPlace, SHARED_KEY);
        persistImage(copiedPlace, SHARED_KEY);

        assertThat(planPlaceImageRepository.existsByImageKeyAndPlanPlace_PlanNot(SHARED_KEY, copiedPlan)).isTrue();
        assertThat(planPlaceImageRepository.existsByImageKeyAndPlanPlace_PlanNot("planPlace/9/image/only.png", copiedPlan)).isFalse();
    }

    private Plan persistPlan(User user) {
        return entityManager.persist(Plan.builder()
                .user(user)
                .planTitle("플랜")
                .isVerified(false)
                .isPlanVisible(true)
                .likeCount(0)
                .scrapCount(0)
                .build());
    }

    private PlanPlace persistPlanPlace(Plan plan, Place place) {
        return entityManager.persist(PlanPlace.builder().plan(plan).place(place).orderIndex(1).isStamped(false).build());
    }

    private void persistImage(PlanPlace planPlace, String imageKey) {
        entityManager.persist(PlanPlaceImage.builder().planPlace(planPlace).imageKey(imageKey).build());
        entityManager.flush();
    }
}
