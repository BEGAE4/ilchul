package com.begae.backend.plan.domain;

import com.begae.backend.plan.enums.ScrappedStatus;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "scrapped_plan")
public class ScrappedPlan {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scrap_id")
    private int scrapId;

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

    public void updateScrappedStatus(ScrappedStatus scrappedStatus) {
        this.scrappedStatus = scrappedStatus;
    }
}
