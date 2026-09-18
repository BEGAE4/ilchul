package com.begae.backend.user.dto;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.common.UserRole;
import com.begae.backend.user.common.UserStatus;
import com.begae.backend.user.domain.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class UserPlansResponseTest {

    @Test
    void 공개_플랜_요약에_인증_여부와_저장_수를_포함한다() {
        User owner = User.builder()
                .userEmail("owner@example.com")
                .socialType(SocialType.SOCIAL_KAKAO)
                .userNickname("작성자")
                .userRole(UserRole.ROLE_USER)
                .userStatus(UserStatus.STATUS_AVAILABLE)
                .build();
        Plan plan = Plan.builder()
                .planId(7)
                .user(owner)
                .planTitle("공개 플랜")
                .isVerified(true)
                .isPlanVisible(true)
                .scrapCount(13)
                .build();

        @SuppressWarnings("unchecked")
        Map<String, Object> summary = new ObjectMapper().convertValue(
                UserPlansResponse.from(List.of(plan)).getPlans().getFirst(),
                Map.class
        );

        assertThat(summary).containsEntry("planVerified", true);
        assertThat(summary).containsEntry("bookmarkCount", 13);
    }
}
