package com.begae.backend.user.domain;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.like.domain.Like;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.ScrappedPlan;
import com.begae.backend.reply.domain.Reply;
import com.begae.backend.report.domain.Report;
import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.common.UserRole;
import com.begae.backend.user.common.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "user")
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

    @Column(name = "user_intro")
    private String userIntro;

    @Column(name = "user_img")
    private String userImg;

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

