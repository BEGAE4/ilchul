package com.begae.backend.place.component;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

class SurveySearchPolicyTest {

    private final SurveySearchPolicy policy = new SurveySearchPolicy();

    @Test
    void 감정에_해당하는_검색어_4개를_돌려준다() {
        List<String> keywords = policy.keywordsFor("생각이 많아졌어요, 정리가 필요해요");
        assertThat(keywords).containsExactly("서점", "북카페", "사찰", "도서관");
    }

    @Test
    void 표에_없는_감정이면_기본행을_쓴다() {
        assertThat(policy.keywordsFor("배고파요"))
                .isEqualTo(policy.keywordsFor("아무 감정도 없이 멍한 느낌이에요"));
    }

    @Test
    void null_감정도_기본행으로_처리한다() {
        assertThat(policy.keywordsFor(null)).hasSize(4);
    }

    @Test
    void 도보는_시간에_비례해_500에서_2000까지_넓어진다() {
        assertThat(policy.radiusMeters("도보", 1)).isEqualTo(500);
        assertThat(policy.radiusMeters("도보", 12)).isEqualTo(2000);
    }

    @Test
    void 자가용은_5000에서_시작한다() {
        assertThat(policy.radiusMeters("자가용", 1)).isEqualTo(5000);
        assertThat(policy.radiusMeters("자가용", 12)).isEqualTo(15000);
    }

    @Test
    void 반경은_API상한_20000을_넘지_않는다() {
        assertThat(policy.radiusMeters("자가용", 999)).isLessThanOrEqualTo(20000);
    }

    @Test
    void 모르는_이동수단은_대중교통으로_본다() {
        assertThat(policy.radiusMeters("헬리콥터", 1))
                .isEqualTo(policy.radiusMeters("대중교통", 1));
    }
}
