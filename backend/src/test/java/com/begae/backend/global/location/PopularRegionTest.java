package com.begae.backend.global.location;

import com.begae.backend.global.exception.CustomException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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
    void 지원하지_않는_지역은_잘못된_입력으로_거절한다() {
        assertThatThrownBy(() -> PopularRegion.from("서울숲"))
                .isInstanceOf(CustomException.class);
    }
}
