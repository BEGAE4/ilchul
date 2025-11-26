package com.begae.backend.plan_place.domain;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.place.domain.Place;
import com.begae.backend.plan.domain.Plan;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "plan_place")
public class PlanPlace extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_place_id")
    private int planPlaceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private Plan plan;

    @Column(name = "order_index")
    private int orderIndex;

    @Column(name = "is_stamped")
    private Boolean isStamped;

    @Column(name = "snapshot_address_name")
    private String snapshotAddressName;

    @Column(name = "snapshot_road_address_name")
    private String snapshotRoadAddressName;

    @Column(name = "snapshot_category_name")
    private String snapshotCategoryName;

    @Column(name = "snapshot_place_name")
    private String snapshotPlaceName;

    @Column(name = "snapshot_longitude")
    private String snapshotLongitude;

    @Column(name = "snapshot_latitude")
    private String snapshotLatitude;

    @OneToMany(mappedBy = "planPlace", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanPlaceImage> planPlaceImages = new ArrayList<>();
}
