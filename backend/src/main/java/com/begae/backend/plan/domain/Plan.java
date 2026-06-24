package com.begae.backend.plan.domain;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.reply.domain.Reply;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "plan")
public class Plan extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Integer planId;

    @Column(name = "plan_title")
    private String planTitle;

    @Column(name = "is_verified")
    private Boolean isVerified;

    @Column(name = "is_plan_visible")
    private Boolean isPlanVisible;

    @Column(name = "is_blinded")
    private Boolean isBlinded;

    @Column(name = "plan_description")
    private String planDescription;

    @Column(name = "required_time")
    private Integer requiredTime;

//    @Column(name = "total_budget") // DB 에서 삭제
//    private Integer totalBudget;

    @Column(name = "total_distance")
    private Integer totalDistance;

    @Column(name = "departure_point")
    private String departurePoint;

    @Column(name = "trip_start_date")
    private LocalDateTime tripStartDate;

    @Column(name = "trip_end_date")
    private LocalDateTime tripEndDate;

    @Column(name = "like_count")
    private Integer likeCount;

    @Column(name = "scrap_count")
    private Integer scrapCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Builder.Default
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanPlace> planPlaces = new ArrayList<>();

//    @Builder.Default
//    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Like> likes = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScrappedPlan> scrappedPlans = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reply> replies = new ArrayList<>();

    public void updateIsPlanVisibility() {
        this.isPlanVisible = !this.isPlanVisible;
    }

    public void decreaseLikeCount() {
        this.likeCount--;
    }

    public void increaseLikeCount() {
        this.likeCount++;
    }

    public void increaseScrappedCount() { this.scrapCount++; }

    public void decreaseScrappedCount() { this.scrapCount--; }

    public static Plan copyOf(Plan source, User newOwner) {
        Plan newPlan = Plan.builder()
                .planTitle(source.getPlanTitle())
                .requiredTime(source.getRequiredTime())
                .totalDistance(source.getTotalDistance())
                .departurePoint(source.getDeparturePoint())
                .user(newOwner)
                .likeCount(0)
                .scrapCount(0)
                .isVerified(false)
                .isPlanVisible(false)
                .isBlinded(false)
                .planPlaces(new ArrayList<>())
                .build();

        source.getPlanPlaces().stream()
                .map(planPlace -> PlanPlace.copyOf(planPlace, newPlan))
                .forEach(newPlan.getPlanPlaces()::add);

        return newPlan;
    }

    public void updateRouteSummary(Integer requiredTime, Integer totalDistance, String departurePoint) {
        this.requiredTime = requiredTime;
        this.totalDistance = totalDistance;
        this.departurePoint = departurePoint;
    }

    public boolean isVerifiedPlan() {
        return Boolean.TRUE.equals(this.isVerified);
    }

    public void updateBasicInfo(String planTitle, Boolean isPlanVisible, String planDescription) {
        if (planTitle != null) {
            this.planTitle = planTitle;
        }

        if (isPlanVisible != null) {
            this.isPlanVisible = isPlanVisible;
        }

        if (planDescription != null) {
            this.planDescription = planDescription;
        }
    }

    public void updateUnverifiedOnlyInfo(LocalDateTime tripStartDate, LocalDateTime tripEndDate) {

        if (tripStartDate != null) {
            this.tripStartDate = tripStartDate;
        }

        if (tripEndDate != null) {
            this.tripEndDate = tripEndDate;
        }
    }

    public void updateBlind() {
        this.isBlinded = true;
    }

    public void validateNotBlinded() {
        if (Boolean.TRUE.equals(this.isBlinded)) {
            throw new CustomException(PlanErrorCode.PLAN_BLINDED);
        }
    }
}
