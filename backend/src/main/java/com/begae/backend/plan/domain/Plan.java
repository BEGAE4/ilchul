package com.begae.backend.plan.domain;

import com.begae.backend.like.domain.Like;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "plan")
public class Plan extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private int planId;

    @Column(name = "plan_title")
    private String planTitle;

    @Column(name = "is_verified")
    private Boolean isVerified;

    @Column(name = "is_plan_visible")
    private Boolean isPlanVisible;

    @Column(name = "plan_description")
    private String planDescription;

    @Column(name = "required_time")
    private Duration requiredTime;

    @Column(name = "total_budget")
    private int totalBudget;

    @Column(name = "total_distance")
    private int totalDistance;

    @Column(name = "departure_point")
    private String departurePoint;

    @Column(name = "trip_date")
    private LocalDateTime tripDate;

    @Column(name = "like_count")
    private Integer likeCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanPlace> planPlaces = new ArrayList<>();

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes = new ArrayList<>();

    public void updateIsPlanVisibility() {
        this.isPlanVisible = !this.isPlanVisible;
    }

    public void decreaseLikeCount() {
        this.likeCount--;
    }

    public void increaseLikeCount() {
        this.likeCount++;
    }
}
