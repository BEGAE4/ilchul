package com.begae.backend.plan.repository;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.dto.PlanDetailFlatDto;
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
}
