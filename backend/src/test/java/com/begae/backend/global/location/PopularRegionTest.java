package com.begae.backend.global.location;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PopularRegionTest {

    @Test
    void 축약형과_정식_명칭을_같은_지역으로_해석한다() {
        assertThat(PopularRegion.from("강원")).isEqualTo(PopularRegion.GANGWON);
        assertThat(PopularRegion.from("강원특별자치도")).isEqualTo(PopularRegion.GANGWON);
        assertThat(PopularRegion.from("전라북도")).isEqualTo(PopularRegion.JEONBUK);
        assertThat(PopularRegion.from("전북특별자치도")).isEqualTo(PopularRegion.JEONBUK);
    }

    @Test
    void 현재와_과거_주소_접두어를_모두_제공한다() {
        assertThat(PopularRegion.CHUNGBUK.getAddressPrefixes())
                .containsExactly("충북", "충청북");
        assertThat(PopularRegion.JEONBUK.getAddressPrefixes())
                .containsExactly("전북", "전라북");
    }

    @Test
    void 지원하지_않는_지역은_빈_결과용_코드로_해석한다() {
        assertThat(PopularRegion.from("서울숲")).isEqualTo(PopularRegion.UNKNOWN);
    }
    @Test
    void 광주와_전남_별칭은_같은_그룹이다() {
        for (String alias : java.util.List.of("광주", "광주광역시", "전남", "전라남도", "전남광주", "전남광주통합특별시")) {
            assertThat(PopularRegion.from(alias)).isEqualTo(PopularRegion.JEONNAM);
        }
        assertThat(PlaceRegion.resolve(null, null, "전남광주통합특별시 동구 금남로", null))
                .isEqualTo(new PlaceRegion("전남", "동구"));
        assertThat(PlaceRegion.resolve(null, null, "  경기   수원시 영통구 매탄동", null))
                .isEqualTo(new PlaceRegion("경기", "수원시 영통구"));
        assertThat(PlaceRegion.resolve("강원특별자치도", "강릉시", "서울 중구", null))
                .isEqualTo(new PlaceRegion("강원", "강릉시"));
        assertThat(PlaceRegion.resolve(null, null, "", "전라남도 순천시"))
                .isEqualTo(new PlaceRegion("전남", "순천시"));
        assertThat(PlaceRegion.resolve(null, null, "알수없음 동구", null).sido()).isNull();
    }
}
