package com.begae.backend.user.domain;

import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.common.UserRole;
import com.begae.backend.user.common.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int userId;

    private String userEmail;

    private SocialType socialType;

    private UserRole userRole;

    private String userPropensity;

    private UserStatus userStatus;

    private String userNickname;

    private String username;

    @CreatedDate
    private LocalDateTime createAt;

    @Builder
    public User(String userEmail, SocialType socialType, String userNickname, UserRole userRole, UserStatus userStatus) {
        this.userEmail = userEmail;
        this.socialType = socialType;
        this.userNickname = userNickname;
        this.userRole = userRole;
        this.userStatus = userStatus;
    }
}

