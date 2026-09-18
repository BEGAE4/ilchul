package com.begae.backend.place.repository;

import com.begae.backend.place.domain.Place;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.user.domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:place-popular-region;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER,VALUE",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class PlaceRepositoryPopularRegionTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PlaceRepository placeRepository;

    @Test
    void 현재와_과거_지역명_주소를_인기순으로_페이지_조회한다() {
        User user = entityManager.persist(User.builder().userNickname("tester").build());
        Place current = persistPlace("전북특별자치도 전주시 완산구", 12);
        Place legacy = persistPlace("전라북도 군산시", 8);
        Place other = persistPlace("서울 중구 봉래동2가", 30);
        connectToVisiblePlan(user, current);
        connectToVisiblePlan(user, legacy);
        connectToVisiblePlan(user, other);
        entityManager.flush();

        List<Integer> firstPage = placeRepository.findPopularPlaceIdsByRegion("전북", "전라북", 1, 0);
        int totalCount = placeRepository.countPopularPlacesByRegion("전북", "전라북");

        assertThat(firstPage).containsExactly(current.getPlaceId());
        assertThat(totalCount).isEqualTo(2);
    }

    private Place persistPlace(String address, int likeCount) {
        Place place = Place.builder()
                .source("KAKAO")
                .sourceId(address)
                .placeName(address)
                .addressName(address)
                .build();
        ReflectionTestUtils.setField(place, "likeCount", likeCount);
        return entityManager.persist(place);
    }

    private void connectToVisiblePlan(User user, Place place) {
        Plan plan = entityManager.persist(Plan.builder()
                .user(user)
                .planTitle(place.getPlaceName())
                .isPlanVisible(true)
                .isBlinded(false)
                .likeCount(0)
                .scrapCount(0)
                .build());
        entityManager.persist(PlanPlace.builder()
                .plan(plan)
                .place(place)
                .orderIndex(1)
                .snapshotAddressName(place.getAddressName())
                .build());
    }
}
