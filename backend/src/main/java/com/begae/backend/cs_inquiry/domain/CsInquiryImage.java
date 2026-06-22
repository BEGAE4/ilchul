package com.begae.backend.cs_inquiry.domain;

import com.begae.backend.global.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "cs_inquiry_image")
public class CsInquiryImage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Integer imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id")
    private CsInquiry csInquiry;

    @Column(name = "image_url")
    private String imageUrl;

    private CsInquiryImage(CsInquiry csInquiry, String imageUrl) {
        this.csInquiry = csInquiry;
        this.imageUrl = imageUrl;
    }

    public static CsInquiryImage of(CsInquiry csInquiry, String imageUrl) {
        return new CsInquiryImage(csInquiry, imageUrl);
    }

    public void setCsInquiry(CsInquiry csInquiry) {
        this.csInquiry = csInquiry;
    }
}
