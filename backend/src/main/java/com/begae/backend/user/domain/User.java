package com.begae.backend.user.domain;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.like.domain.Like;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.ScrappedPlan;
import com.begae.backend.reply.domain.Reply;
import com.begae.backend.report.domain.AdminLog;
import com.begae.backend.report.domain.Report;
import com.begae.backend.report.domain.Sanction;
import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.common.UserRole;
import com.begae.backend.user.common.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "user")
public class User extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    Integer userId;

    @Column(name = "user_email")
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "social_type")
    private SocialType socialType;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role")
    private UserRole userRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_status")
    private UserStatus userStatus;

    @Column(name = "user_nickname")
    private String userNickname;

    @Column(name = "user_intro")
    private String userIntro;

    @Column(name = "user_img", length = 2000)
    private String userImg;

    @Column(name = "warning_count")
    private Integer warningCount;

    @Column(name = "suspension_end_at")
    private LocalDateTime suspensionEndAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Plan> plans = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScrappedPlan> scrappedPlans = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CsInquiry> inquiries = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reply> replies = new ArrayList<>();

    @OneToMany(mappedBy = "reportUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> reports = new ArrayList<>();

    @OneToMany(mappedBy = "reportedUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> reported = new ArrayList<>();

    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdminLog> adminLogs = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sanction> sanctions = new ArrayList<>();

    @Builder
    public User(String userEmail, SocialType socialType, String userNickname, UserRole userRole, UserStatus userStatus, String userIntro, String userImg) {
        this.userEmail = userEmail;
        this.socialType = socialType;
        this.userNickname = userNickname;
        this.userRole = userRole;
        this.userStatus = userStatus;
        this.userIntro = userIntro;
        this.userImg = userImg;
    }

    public void updateUserProfile(String userNickname, String userIntro, String userImg) {
        this.userNickname = userNickname;
        this.userIntro = userIntro;
        this.userImg = userImg;
    }
}

