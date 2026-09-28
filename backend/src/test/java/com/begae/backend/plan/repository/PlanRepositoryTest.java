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

        List<Integer> firstPage = planRepository.findPopularPlanIdsByRegion("강원", List.of(""), true, 1, 0);
        int totalCount = planRepository.countPopularPlansByRegion("강원", List.of(""), true);

        assertThat(firstPage).containsExactly(higherRanked.getPlanId());
        assertThat(totalCount).isEqualTo(2);
    }

    @Test
    void 내_플랜과_공개_플랜은_생성시각_ID_내림차순으로_페이지를_나눈다() {
        User owner = entityManager.persist(User.builder().userNickname("pages").build());
        Plan older = persistPlan(owner, "older", 0, 0);
        Plan newer = persistPlan(owner, "newer", 0, 0);
        Plan hidden = persistPlan(owner, "hidden", 0, 0);
        org.springframework.test.util.ReflectionTestUtils.setField(hidden, "isPlanVisible", false);
        entityManager.flush();
        entityManager.getEntityManager().createNativeQuery("UPDATE plan SET create_at = '2020-01-01 00:00:00' WHERE user_id = :owner")
                .setParameter("owner", owner.getUserId()).executeUpdate();
        entityManager.clear();
        var page = org.springframework.data.domain.PageRequest.of(0, 1);
        assertThat(planRepository.findMyPlansPage(owner.getUserId(), page).getContent())
                .extracting(Plan::getPlanId).containsExactly(hidden.getPlanId());
        var first = planRepository.findPublicPlansPage(owner.getUserId(), page);
        assertThat(first.getTotalElements()).isEqualTo(2);
        assertThat(first.hasNext()).isTrue();
        assertThat(first.getContent()).extracting(Plan::getPlanId).containsExactly(newer.getPlanId());
        var second = planRepository.findPublicPlansPage(owner.getUserId(), page.next());
        assertThat(second.getContent()).extracting(Plan::getPlanId).containsExactly(older.getPlanId());
        assertThat(second.hasNext()).isFalse();
        assertThat(planRepository.findPublicPlansPage(owner.getUserId(), page.next().next()).getContent()).isEmpty();
    }

    @Test
    void 지역과_시군구는_동일한_경유_장소에서_충족해야_한다() {
        User owner = entityManager.persist(User.builder().userNickname("districts").build());
        Plan match = persistPlan(owner, "광주", 1, 0);
        Place dong = persistPlace("전남광주통합특별시 동구 금남로");
        connect(match, dong, 1);
        Plan mismatch = persistPlan(owner, "서로 다른 장소", 2, 0);
        connect(mismatch, persistPlace("전남 순천시 조례동"), 1);
        connect(mismatch, persistPlace("부산 동구 초량동"), 2);
        entityManager.flush();
        assertThat(planRepository.findPopularPlanIdsByRegion("전남", List.of("동구", "북구"), false, 20, 0))
                .containsExactly(match.getPlanId());
        assertThat(planRepository.countPopularPlansByRegion("전남", List.of("동구"), false)).isEqualTo(1);
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
