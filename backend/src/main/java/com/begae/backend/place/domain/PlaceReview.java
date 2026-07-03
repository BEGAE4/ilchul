package com.begae.backend.place.domain;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "place_review")
public class PlaceReview extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Integer reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Builder
    public PlaceReview(User user, Place place, String content) {
        this.user = user;
        this.place = place;
        this.content = content;
    }

    public static PlaceReview of(User user, Place place, String content) {
        return PlaceReview.builder()
                .user(user)
                .place(place)
                .content(content)
                .build();
    }
}
