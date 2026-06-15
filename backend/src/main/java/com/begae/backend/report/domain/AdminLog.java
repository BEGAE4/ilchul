package com.begae.backend.report.domain;

import com.begae.backend.report.enums.AdminAction;
import com.begae.backend.report.enums.ReportType;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "admin_log")
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admin_log_id")
    private Integer logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private AdminAction action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private ReportType targetType;

    @Column(name = "target_id", nullable = false)
    private Integer targetId;

    @Column(name = "note")
    private String note;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    public static AdminLog of(User admin, AdminAction action, Report report, String note) {
        return AdminLog.builder()
                .admin(admin)
                .action(action)
                .report(report)
                .targetType(report.getReportType())
                .targetId(report.getTypeId())
                .note(note)
                .processedAt(LocalDateTime.now())
                .build();
    }
}