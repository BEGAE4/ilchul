package com.begae.backend.plan.domain;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.plan.enums.ScrappedStatus;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "scrapped_plan")
public class ScrappedPlan extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scrap_id")
    private Integer scrapId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private Plan plan;

    @Column(name = "scrapped_at", updatable = false)
    private LocalDateTime scrappedAt;

    @Column(name = "scrapped_status")
    private ScrappedStatus scrappedStatus;

    public static ScrappedPlan of(User user, Plan plan) {
        return ScrappedPlan.builder()
                .user(user)
                .plan(plan)
                .scrappedAt(LocalDateTime.now())
                .scrappedStatus(ScrappedStatus.Y)
                .build();
    }

    public void toggle() {
        if (this.scrappedStatus == ScrappedStatus.Y) {
            this.scrappedStatus = ScrappedStatus.N;
            this.plan.decreaseScrappedCount();
        } else {
            this.scrappedStatus = ScrappedStatus.Y;
            this.plan.increaseScrappedCount();
        }
    }

    public boolean isScrapped() {
        return this.scrappedStatus == ScrappedStatus.Y;
    }
}
