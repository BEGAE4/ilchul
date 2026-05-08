package com.begae.backend.cs_inquiry.domain;

import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(name = "cs_inquiry")
public class CsInquiry {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inquiry_id")
    private Integer inquiryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "content")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "inquiry_type")
    private InquiryType inquiryType;

    @Column(name = "inquiry_at")
    private LocalDateTime inquiryAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "inquiry_status")
    private InquiryStatus inquiryStatus;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

}
