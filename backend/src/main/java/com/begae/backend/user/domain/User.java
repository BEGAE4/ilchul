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
import com.begae.backend.storage.converter.ImageUrlConverter;
import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.common.UserRole;
import com.begae.backend.user.common.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.util.StringUtils;

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
    @Convert(converter = ImageUrlConverter.class)
    private String userImg;

    @Column(name = "user_img_key", length = 1000)
    private String userImgKey;

    @Column(name = "social_image_sync_disabled", nullable = false)
    private boolean socialImageSyncDisabled = false;

    @Column(name = "warning_count")
    private Integer warningCount = 0;

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
    public User(String userEmail, SocialType socialType, String userNickname, UserRole userRole, UserStatus userStatus,
                String userIntro, String userImg, String userImgKey, boolean socialImageSyncDisabled) {
        this.userEmail = userEmail;
        this.socialType = socialType;
        this.userNickname = userNickname;
        this.userRole = userRole;
        this.userStatus = userStatus;
        this.userIntro = userIntro;
        this.userImg = userImg;
        this.userImgKey = userImgKey;
        this.socialImageSyncDisabled = socialImageSyncDisabled;
        this.warningCount = 0;
    }

    public void updateUserProfile(String userNickname, String userIntro) {
        this.userNickname = userNickname;
        this.userIntro = userIntro;
    }

    public boolean canSyncSocialProfileImage() {
        return !socialImageSyncDisabled && !StringUtils.hasText(userImg);
    }

    public void applySocialProfileImage(String imageUrl, String imageKey) {
        if (canSyncSocialProfileImage() && StringUtils.hasText(imageUrl)) {
            this.userImg = imageUrl;
            this.userImgKey = imageKey;
        }
    }

    public void replaceProfileImage(String imageUrl, String imageKey) {
        this.userImg = imageUrl;
        this.userImgKey = imageKey;
        this.socialImageSyncDisabled = true;
    }

    public void removeProfileImage() {
        this.userImg = null;
        this.userImgKey = null;
        this.socialImageSyncDisabled = true;
    }

    public void increaseWarningCount() {
        this.warningCount = this.warningCount == null ? 1 : this.warningCount + 1;
    }

    public void applySuspension(LocalDateTime endAt) {
        this.suspensionEndAt = endAt;
        this.userStatus = UserStatus.STATUS_UNAVAILABLE;
    }

    public void applyPermanentBan() {
        this.userStatus = UserStatus.STATUS_UNAVAILABLE;
        this.suspensionEndAt = null;
    }
}
