package com.begae.backend.plan_place.domain;

import com.begae.backend.global.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "plan_place_image")
public class PlanPlaceImage extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_place_image_id")
    private Integer planPlaceImageId;

    @Column(name = "image_url", length = 2000)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_place_id")
    private PlanPlace planPlace;

    public static PlanPlaceImage copyOf(PlanPlaceImage source, PlanPlace newPlanPlace) {
        return PlanPlaceImage.builder()
                .imageUrl(source.getImageUrl())
                .planPlace(newPlanPlace)
                .build();
    }
}
