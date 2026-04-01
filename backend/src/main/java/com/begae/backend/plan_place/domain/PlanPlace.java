package com.begae.backend.plan_place.domain;

import com.begae.backend.place.domain.Place;
import com.begae.backend.plan.domain.Plan;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(name = "plan_place")
public class PlanPlace {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_place_id")
    private int planPlaceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @Column(name = "order_index")
    private int orderIndex;

    @Column(name = "travel_time")
    private int travelTime;

    @Column(name = "stay_time")
    private int stayTime;

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

    @Column(name = "snapshot_x")
    private double snapshotX;

    @Column(name = "snapshot_y")
    private double snapshotY;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private Plan plan;

    @Builder.Default
    @OneToMany(mappedBy = "planPlace", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanPlaceImage> planPlaceImages = new ArrayList<>();
}
