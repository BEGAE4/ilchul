package com.begae.backend.place.domain;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.place.domain.Place;
import com.begae.backend.plan.enums.ScrappedStatus;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "scrapped_place")
public class ScrappedPlace extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scrap_id")
    private Integer scrapId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @Column(name = "scrapped_at", updatable = false)
    private LocalDateTime scrappedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "scrapped_status")
    private ScrappedStatus scrappedStatus;

    @Builder
    public ScrappedPlace(User user, Place place, LocalDateTime scrappedAt, ScrappedStatus scrappedStatus) {
        this.user = user;
        this.place = place;
        this.scrappedAt = scrappedAt;
        this.scrappedStatus = scrappedStatus;
    }

    public static ScrappedPlace of(User user, Place place) {
        return ScrappedPlace.builder()
                .user(user)
                .place(place)
                .scrappedAt(LocalDateTime.now())
                .scrappedStatus(ScrappedStatus.Y)
                .build();
    }

    public void toggle() {
        if (this.scrappedStatus == ScrappedStatus.Y) {
            this.scrappedStatus = ScrappedStatus.N;
        } else {
            this.scrappedStatus = ScrappedStatus.Y;
        }
    }

    public boolean isScrapped() {
        return this.scrappedStatus == ScrappedStatus.Y;
    }
}
