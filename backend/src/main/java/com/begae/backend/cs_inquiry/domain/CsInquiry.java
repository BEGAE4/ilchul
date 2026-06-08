package com.begae.backend.cs_inquiry.domain;

import com.begae.backend.cs_inquiry.enums.InquiryStatus;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "cs_inquiry")
public class CsInquiry extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inquiry_id")
    private Integer inquiryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "title")
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    private String imgUrl;

    @OneToMany(mappedBy = "csInquiry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CsInquiryImage> images = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "inquiry_type")
    private InquiryType inquiryType;

    @Enumerated(EnumType.STRING)
    @Column(name = "inquiry_status")
    private InquiryStatus inquiryStatus;

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    private CsInquiry(User user, String content, InquiryType inquiryType) {
        this.user = user;
        this.content = content;
        this.inquiryType = inquiryType;
        this.inquiryStatus = InquiryStatus.OPEN;
        this.isDeleted = false;
    }

    public static CsInquiry of(User user, String content, InquiryType inquiryType) {
        return new CsInquiry(user, content, inquiryType);
    }

    public void updateContent(String content, InquiryType inquiryType) {
        this.content = content;
        this.inquiryType = inquiryType;
    }

    public void reply(String answer) {
        this.answer = answer;
        this.inquiryStatus = InquiryStatus.RESOLVED;
        this.answeredAt = LocalDateTime.now();
    }

    public void close() {
        this.inquiryStatus = InquiryStatus.CLOSED;
        this.closedAt = LocalDateTime.now();
    }

    public void deleteInquiry() {
        this.isDeleted = true;
    }

    public void addImage(CsInquiryImage image) {
        this.images.add(image);
        image.setCsInquiry(this);
    }

    public void removeImage(CsInquiryImage image) {
        this.images.remove(image);
        image.setCsInquiry(null);
    }
}


