package com.begae.backend.user.domain;

import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.common.UserRole;
import com.begae.backend.user.common.UserStatus;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class UserProfileImageStateTest {

    @Test
    void 사용자가_사진을_삭제하면_이후_소셜_사진_자동_동기화를_막는다() throws Exception {
        User user = User.builder()
                .userEmail("user@example.com")
                .socialType(SocialType.SOCIAL_KAKAO)
                .userNickname("사용자")
                .userRole(UserRole.ROLE_USER)
                .userStatus(UserStatus.STATUS_AVAILABLE)
                .userImg("https://cdn.example.com/users/profile/old.png")
                .build();

        Method remove = User.class.getMethod("removeProfileImage");
        Method sync = User.class.getMethod("applySocialProfileImage", String.class, String.class);
        remove.invoke(user);
        sync.invoke(user, "https://cdn.example.com/users/profile/social.png", "users/profile/social.png");

        assertThat(user.getUserImg()).isNull();
        assertThat(readBoolean(user, "isSocialImageSyncDisabled")).isTrue();
    }

    private boolean readBoolean(User user, String methodName) throws Exception {
        return (boolean) User.class.getMethod(methodName).invoke(user);
    }
}
