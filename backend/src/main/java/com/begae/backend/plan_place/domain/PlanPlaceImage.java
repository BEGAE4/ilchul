package com.begae.backend.plan_place.domain;

import com.begae.backend.global.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@Table(name = "plan_place_image")
public class PlanPlaceImage extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_place_image_id")
    private Integer planPlaceImageId;

    @Column(name = "image_key", length = 1000)
    private String imageKey;

    @Column(name = "image_url", length = 2000)
    private String imageUrl;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_place_id")
    private PlanPlace planPlace;

    public static PlanPlaceImage copyOf(PlanPlaceImage source, PlanPlace newPlanPlace) {
        return PlanPlaceImage.builder()
                .imageKey(source.getImageKey())
                .imageUrl(source.getImageUrl())
                .originalFilename(source.getOriginalFilename())
                .contentType(source.getContentType())
                .fileSize(source.getFileSize())
                .planPlace(newPlanPlace)
                .build();
    }
}
