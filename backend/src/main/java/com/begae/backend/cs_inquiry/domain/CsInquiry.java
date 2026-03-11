package com.begae.backend.cs_inquiry.domain;

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
    private int inquiryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "content")
    private String content;

    @Column(name = "inquiry_type")
    private char inquiryType;

    @Column(name = "inquiry_at")
    private LocalDateTime inquiryAt;

    @Column(name = "iquiry_status")
    private char iquitryStatus;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

}
