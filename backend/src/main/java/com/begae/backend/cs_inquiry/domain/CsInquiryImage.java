package com.begae.backend.cs_inquiry.domain;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.storage.dto.StoredImage;
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

    @Column(name = "image_key", length = 1000)
    private String imageKey;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    private CsInquiryImage(CsInquiry csInquiry, String imageUrl) {
        this.csInquiry = csInquiry;
        this.imageUrl = imageUrl;
    }

    public static CsInquiryImage of(CsInquiry csInquiry, String imageUrl) {
        CsInquiryImage image = new CsInquiryImage(csInquiry, imageUrl);
        image.imageKey = imageUrl;
        return image;
    }

    public static CsInquiryImage of(CsInquiry csInquiry, StoredImage storedImage) {
        CsInquiryImage image = new CsInquiryImage();
        image.csInquiry = csInquiry;
        image.imageKey = storedImage.imageKey();
        image.originalFilename = storedImage.originalFilename();
        image.contentType = storedImage.contentType();
        image.fileSize = storedImage.fileSize();
        return image;
    }

    public String getStorageKey() {
        return imageKey != null && !imageKey.isBlank() ? imageKey : imageUrl;
    }

    public void setCsInquiry(CsInquiry csInquiry) {
        this.csInquiry = csInquiry;
    }
}
