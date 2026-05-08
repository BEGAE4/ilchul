package com.begae.backend.report.domain;

import com.begae.backend.report.enums.ReportReason;
import com.begae.backend.report.enums.ReportType;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(name = "report")
public class Report {

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

}
