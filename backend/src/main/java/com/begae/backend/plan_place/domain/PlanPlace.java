package com.begae.backend.plan_place.domain;

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

    @Column(name = "is_stamped")
    private Boolean isStamped;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private Plan plan;

    @OneToMany(mappedBy = "planPlace", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanPlaceImage> planPlaceImages = new ArrayList<>();
}
