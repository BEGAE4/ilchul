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

        List<Integer> firstPage = placeRepository.findPopularPlaceIdsByRegion("전북", List.of(""), true, 1, 0);
        int totalCount = placeRepository.countPopularPlacesByRegion("전북", List.of(""), true);

        assertThat(firstPage).containsExactly(current.getPlaceId());
        assertThat(totalCount).isEqualTo(2);
    }

    @Test
    void 광주_전남_통합그룹의_시군구를_필터하고_메타_개수와_맞춘다() {
        User user = entityManager.persist(User.builder().userNickname("districts").build());
        Place dong = persistPlace("전남광주통합특별시 동구 금남로", 12);
        Place north = persistPlace("광주 북구 용봉동", 8);
        Place suncheon = persistPlace("전라남도 순천시 조례동", 10);
        persistPlace("전남 담양군 비공개", 30);
        connectToVisiblePlan(user, dong);
        connectToVisiblePlan(user, dong); // 한 장소가 여러 플랜에 있어도 중복 집계하지 않는다.
        connectToVisiblePlan(user, north);
        connectToVisiblePlan(user, suncheon);
        entityManager.flush();
        var ids = placeRepository.findPopularPlaceIdsByRegion("전남", List.of("동구", "북구"), false, 1, 0);
        assertThat(ids).containsExactly(dong.getPlaceId());
        assertThat(placeRepository.countPopularPlacesByRegion("전남", List.of("동구", "북구"), false)).isEqualTo(2);
        assertThat(placeRepository.findPopularPlaceIdsByRegion("전남", List.of("동구", "북구"), false, 1, 1))
                .containsExactly(north.getPlaceId());
        var metadata = new com.begae.backend.global.location.RegionController(placeRepository).getRegions();
        assertThat(metadata.regions()).hasSize(16);
        var region = metadata.regions().stream().filter(row -> row.region().equals("전남")).findFirst().orElseThrow();
        assertThat(region.name()).isEqualTo("광주·전남");
        assertThat(region.placeCount()).isEqualTo(3);
        assertThat(region.sigungu()).extracting(com.begae.backend.global.location.RegionController.District::sigungu)
                .containsExactly("담양군", "동구", "북구", "순천시");
        assertThat(region.sigungu().getFirst().placeCount()).isZero();
        assertThat(region.aliases()).contains("광주", "전남광주통합특별시");
        assertThat(metadata.regions().stream().filter(row -> row.region().equals("서울")).findFirst().orElseThrow().placeCount()).isZero();
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
