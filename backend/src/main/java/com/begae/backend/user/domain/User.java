package com.begae.backend.user.domain;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.common.UserRole;
import com.begae.backend.user.common.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    int userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "social_type")
    private SocialType socialType;

    @Column(name = "user_role")
    private UserRole userRole;

    @Column(name = "user_status")
    private UserStatus userStatus;

    @Column(name = "user_nickname")
    private String userNickname;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Plan> plans = new ArrayList<>();

    @Builder
    public User(String userEmail, SocialType socialType, String userNickname, UserRole userRole, UserStatus userStatus) {
        this.userEmail = userEmail;
        this.socialType = socialType;
        this.userNickname = userNickname;
        this.userRole = userRole;
        this.userStatus = userStatus;
    }

    public void updateUserNickname(String userNickname) {
        this.userNickname = userNickname;
    }
}

