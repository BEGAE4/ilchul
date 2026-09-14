package com.begae.backend.storage.converter;

import com.begae.backend.place.domain.Place;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.PlanImage;
import com.begae.backend.plan.dto.PlanDetailFlatDto;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.storage.config.S3StorageProperties;
import com.begae.backend.user.domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:image-url-converter;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER,VALUE",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import(ImageUrlConverterJpaTest.StoragePropertiesConfig.class)
class ImageUrlConverterJpaTest {

    // application-test.yml 의 cloud.aws.s3.public-base-url
    private static final String BASE_URL = "http://localhost/storage";

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PlanRepository planRepository;

    @Test
    void 미치환_URL로_저장된_플랜_사진은_현재_base_URL로_조회된다() {
        Plan plan = persistPlan(persistUser(null));
        PlanImage image = entityManager.persist(PlanImage.builder()
                .plan(plan)
                .imageKey("plan/1/image/a.png")
                .imageUrl("${STORAGE_PUBLIC_URL}/plan/1/image/a.png")
                .build());
        entityManager.flush();
        entityManager.clear();

        PlanImage reloaded = entityManager.find(PlanImage.class, image.getPlanImageId());

        assertThat(reloaded.getImageUrl()).isEqualTo(BASE_URL + "/plan/1/image/a.png");
    }

    @Test
    void 플랜_상세_조회에서도_식별자뿐인_장소_사진과_프로필은_null로_내려간다() {
        Plan plan = persistPlan(persistUser("img5"));
        Place place = entityManager.persist(Place.builder().placeName("조계사").placeImageUrl("img1").build());
        entityManager.persist(PlanPlace.builder().plan(plan).place(place).orderIndex(1).build());
        entityManager.flush();
        entityManager.clear();

        List<PlanDetailFlatDto> flats = planRepository.findPlanDetailFlat(plan.getPlanId());

        assertThat(flats).singleElement().satisfies(flat -> {
            assertThat(flat.getPlaceImage()).isNull();
            assertThat(flat.getUserImg()).isNull();
        });
    }

    private User persistUser(String userImg) {
        return entityManager.persist(User.builder().userNickname("tester").userImg(userImg).build());
    }

    private Plan persistPlan(User user) {
        return entityManager.persist(Plan.builder()
                .user(user)
                .planTitle("사진 플랜")
                .isVerified(false)
                .isPlanVisible(true)
                .likeCount(0)
                .scrapCount(0)
                .build());
    }

    @TestConfiguration
    @EnableConfigurationProperties(S3StorageProperties.class)
    static class StoragePropertiesConfig {
    }
}
