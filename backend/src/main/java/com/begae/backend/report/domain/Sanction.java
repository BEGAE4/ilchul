package com.begae.backend.report.domain;

import com.begae.backend.report.enums.SanctionType;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "sanction")
public class Sanction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sanction_id")
    private Integer sanctionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private SanctionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(name = "reason_label")
    private String reasonLabel;

    @Column(name = "note")
    private String note;

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;

    @Column(name = "suspension_end_at")
    private LocalDateTime suspensionEndAt;

    @Column(name = "is_released", nullable = false)
    private boolean isReleased;

    @Column(name = "released_at")
    private LocalDateTime releasedAt;

    // 팩토리 메서드
    public static Sanction warned(User user, Report report, User admin, String note) {
        return Sanction.builder()
                .user(user)
                .type(SanctionType.WARNED)
                .report(report)
                .admin(admin)
                .reasonLabel(report != null ? report.getReportReason().getDescription() : null)
                .note(note)
                .appliedAt(LocalDateTime.now())
                .isReleased(false)
                .build();
    }

    public static Sanction banned(User user, Report report, User admin, String note,
                                  LocalDateTime endAt) {
        return Sanction.builder()
                .user(user)
                .type(SanctionType.BANNED)
                .report(report)
                .admin(admin)
                .reasonLabel(report != null ? report.getReportReason().getDescription() : null)
                .note(note)
                .appliedAt(LocalDateTime.now())
                .suspensionEndAt(endAt)
                .isReleased(false)
                .build();
    }

    public static Sanction blinded(User user, Report report, User admin, String note) {
        return Sanction.builder()
                .user(user)
                .type(SanctionType.BLINDED)
                .report(report)
                .admin(admin)
                .reasonLabel(report != null ? report.getReportReason().getDescription() : null)
                .note(note)
                .appliedAt(LocalDateTime.now())
                .isReleased(false)
                .build();
    }

    public void release() {
        this.isReleased = true;
        this.releasedAt = LocalDateTime.now();
    }
}