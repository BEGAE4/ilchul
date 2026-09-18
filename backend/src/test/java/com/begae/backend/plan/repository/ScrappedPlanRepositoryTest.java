package com.begae.backend.plan.repository;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.ScrappedPlan;
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
        "spring.datasource.url=jdbc:h2:mem:scrapped-plan-repository;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER,VALUE",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class ScrappedPlanRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ScrappedPlanRepository scrappedPlanRepository;

    private User viewer;
    private Plan publicPlan;
    private Plan ownPrivatePlan;

    @BeforeEach
    void setUp() {
        User owner = entityManager.persist(User.builder().userNickname("owner").build());
        viewer = entityManager.persist(User.builder().userNickname("viewer").build());

        publicPlan = persistPlan(owner, true, false);
        Plan privatePlan = persistPlan(owner, false, false);
        Plan blindedPlan = persistPlan(owner, true, true);
        Plan cancelledPlan = persistPlan(owner, true, false);
        ownPrivatePlan = persistPlan(viewer, false, false);

        scrap(publicPlan);
        scrap(privatePlan);
        scrap(blindedPlan);
        scrap(cancelledPlan).toggle();
        scrap(ownPrivatePlan);
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    void 저장한_플랜_목록에는_볼_수_없게_된_남의_플랜을_빼고_돌려준다() {
        assertThat(scrappedPlanRepository.findPlanIdsByUserId(viewer.getUserId()))
                .containsExactlyInAnyOrder(publicPlan.getPlanId(), ownPrivatePlan.getPlanId());
    }

    @Test
    void 저장한_플랜_수는_목록과_같은_기준으로_센다() {
        assertThat(scrappedPlanRepository.countVisibleScrappedPlans(viewer.getUserId())).isEqualTo(2);
    }

    @Test
    void 저장한_플랜_관계와_저장_시각을_함께_조회한다() {
        assertThat(scrappedPlanRepository.findVisibleScrapsByUserId(viewer.getUserId()))
                .extracting(scrap -> scrap.getPlan().getPlanId())
                .containsExactlyInAnyOrder(publicPlan.getPlanId(), ownPrivatePlan.getPlanId());
        assertThat(scrappedPlanRepository.findVisibleScrapsByUserId(viewer.getUserId()))
                .allSatisfy(scrap -> assertThat(scrap.getScrappedAt()).isNotNull());
    }

    private Plan persistPlan(User user, boolean visible, boolean blinded) {
        return entityManager.persist(Plan.builder()
                .user(user).planTitle("플랜").isVerified(false)
                .isPlanVisible(visible).isBlinded(blinded).likeCount(0).scrapCount(0)
                .build());
    }

    private ScrappedPlan scrap(Plan plan) {
        return entityManager.persist(ScrappedPlan.of(viewer, plan));
    }
}
