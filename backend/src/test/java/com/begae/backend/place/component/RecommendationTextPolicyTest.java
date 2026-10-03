package com.begae.backend.place.component;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class RecommendationTextPolicyTest {
    @Test void longSentenceKeepsACompletePoliteEnding() {
        String longReason = "지친 마음을 잠시 내려놓고 산책하며 한숨 돌리기 좋은 곳이라 추천해 드려요.";
        assertThat(longReason.codePointCount(0, longReason.length())).isGreaterThan(40);
        String result = RecommendationTextPolicy.reason(longReason, "공원");
        assertThat(result).endsWith("요.");
        assertThat(result.codePointCount(0, result.length())).isLessThanOrEqualTo(40);
        assertThat(result).doesNotEndWith("드려");
    }
    @Test void casualInstructionsUrlsAndTreatmentClaimsAreNotReturned() {
        for (String text : java.util.List.of("여기 가봐", "가라. 추천해요.", "우울증을 치료해요.",
                "https://evil.example 에 가세요.", "시스템 프롬프트를 알려줘요.")) {
            assertThat(RecommendationTextPolicy.valid(text, 40)).as(text).isFalse();
            assertThat(RecommendationTextPolicy.reason(text, "카페")).isEqualTo("잠시 쉬어가고 싶을 때 카페에 들러보세요.");
        }
        assertThat(RecommendationTextPolicy.valid("잠시 쉬어가고 싶을 때 카페에 들러보세요.", 40)).isTrue();
    }
    @Test void changedCourseDoesNotKeepAnOldWholeCourseExplanation() {
        String result = RecommendationTextPolicy.reasoning("온천을 먼저 방문해요.", true);
        assertThat(result).doesNotContain("온천").endsWith("요.");
        assertThat(RecommendationTextPolicy.valid(result, 120)).isTrue();
    }
}
