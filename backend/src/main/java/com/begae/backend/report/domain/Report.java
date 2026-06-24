package com.begae.backend.report.domain;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.report.dto.CreateReportRequestDto;
import com.begae.backend.report.enums.ReportReason;
import com.begae.backend.report.enums.ReportStatus;
import com.begae.backend.report.enums.ReportType;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "report")
public class Report extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Integer reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_user_id")
    private User reportUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;

    @Builder.Default
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdminLog> adminLogs = new ArrayList<>();
    
    @Builder.Default
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sanction> sanctions = new ArrayList<>();

    @Column(name = "type_id")
    private Integer typeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type")
    private ReportType reportType;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_reason")
    private ReportReason reportReason;

    @Column(name = "content")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReportStatus reportStatus;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    public void updateReportStatus(ReportStatus reportStatus) {
        this.reportStatus = reportStatus;
    }

    public static Report of(User reporter, User reportedUser, CreateReportRequestDto createReportRequestDto) {
        return Report.builder()
                .reportUser(reporter)
                .reportedUser(reportedUser)
                .typeId(createReportRequestDto.getTargetId())
                .reportType(createReportRequestDto.getTargetType())
                .reportReason(createReportRequestDto.getReasonCode())
                .content(createReportRequestDto.getDetail())
                .reportStatus(ReportStatus.PENDING)
                .build();
    }
}
