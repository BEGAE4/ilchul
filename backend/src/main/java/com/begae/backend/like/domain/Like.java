package com.begae.backend.like.domain;

import com.begae.backend.like.enums.LikeType;
import com.begae.backend.place.domain.Place;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "likes")
public class Like {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Integer likeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "type_id")
    private Integer typeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "like_type")
    private LikeType likeType;

    @Column(name = "like_status")
    private Boolean likeStatus;

    public static Like createPlanLike(User user, Plan plan) {
        Like like = new Like();
        like.user = user;
        like.typeId = plan.getPlanId();
        like.likeType = LikeType.PLAN;
        like.likeStatus = true;
        return like;
    }

    public static Like createPlaceLike(User user, Place place) {
        Like like = new Like();
        like.user = user;
        like.typeId = place.getPlaceId();
        like.likeType = LikeType.PLACE;
        like.likeStatus = true;
        return like;
    }

    public void toggleLikeStatus() {
        this.likeStatus = !this.likeStatus;
    }
}
