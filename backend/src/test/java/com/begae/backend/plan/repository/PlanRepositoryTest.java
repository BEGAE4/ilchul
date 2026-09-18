package com.begae.backend.plan.repository;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.dto.PlanDetailFlatDto;
import com.begae.backend.place.domain.Place;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.user.domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:plan-repository;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER,VALUE",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class PlanRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PlanRepository planRepository;

    @Test
    void 소요시간과_거리가_비어있는_플랜도_상세_조회된다() {
        User user = entityManager.persist(User.builder().userNickname("tester").build());
        Plan plan = entityManager.persist(Plan.builder()
                .user(user)
                .planTitle("일정 미정 플랜")
                .isVerified(false)
                .isPlanVisible(true)
                .likeCount(0)
                .scrapCount(0)
                .build());
        entityManager.flush();
        entityManager.clear();

        List<PlanDetailFlatDto> flats = planRepository.findPlanDetailFlat(plan.getPlanId());

        assertThat(flats).hasSize(1);
        assertThat(flats.getFirst().getRequiredTime()).isNull();
        assertThat(flats.getFirst().getTotalDistance()).isNull();
    }

    @Test
    void 방문_장소_중_하나라도_지역이_맞으면_인기순으로_페이지_조회한다() {
        User user = entityManager.persist(User.builder().userNickname("region-tester").build());
        Place seoul = persistPlace("서울 중구");
        Place gangwon = persistPlace("강원특별자치도 춘천시");
        Place legacyGangwon = persistPlace("강원도 강릉시");

        Plan lowerRanked = persistPlan(user, "서울에서 강원", 2, 1);
        connect(lowerRanked, seoul, 1);
        connect(lowerRanked, gangwon, 2);

        Plan higherRanked = persistPlan(user, "옛 강원 표기", 7, 2);
        connect(higherRanked, legacyGangwon, 1);

        Plan other = persistPlan(user, "서울만", 20, 20);
        connect(other, seoul, 1);
        entityManager.flush();

        List<Integer> firstPage = planRepository.findPopularPlanIdsByRegion("강원", "강원", 1, 0);
        int totalCount = planRepository.countPopularPlansByRegion("강원", "강원");

        assertThat(firstPage).containsExactly(higherRanked.getPlanId());
        assertThat(totalCount).isEqualTo(2);
    }

    private Place persistPlace(String address) {
        return entityManager.persist(Place.builder()
                .source("KAKAO")
                .sourceId(address)
                .placeName(address)
                .addressName(address)
                .build());
    }

    private Plan persistPlan(User user, String title, int likes, int scraps) {
        return entityManager.persist(Plan.builder()
                .user(user)
                .planTitle(title)
                .isPlanVisible(true)
                .isBlinded(false)
                .likeCount(likes)
                .scrapCount(scraps)
                .build());
    }

    private void connect(Plan plan, Place place, int orderIndex) {
        entityManager.persist(PlanPlace.builder()
                .plan(plan)
                .place(place)
                .orderIndex(orderIndex)
                .snapshotAddressName(place.getAddressName())
                .build());
    }
}
