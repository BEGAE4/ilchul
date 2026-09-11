package com.begae.backend.place.domain;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.place.dto.PlaceUpsertCommand;
import com.begae.backend.plan_place.domain.PlanPlace;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Table(name = "place")
public class Place extends BaseEntity {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "place_id")
    private Integer placeId;

    @Column(name = "source_id", length = 50)
    private String sourceId;

    @Column(name = "address_name", length = 300)
    private String addressName;

    @Column(name = "road_address_name", length = 300)
    private String roadAddressName;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "place_name")
    private String placeName;

    @Column(name = "place_url", length = 2000)
    private String placeUrl;

    @Column(name = "place_image_url", length = 2000)
    private String placeImageUrl;

    @Column
    private Double x;

    @Column
    private Double y;

    @Column(name = "last_fetched_at")
    private LocalDateTime lastFetchedAt;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name = "source", length = 20)
    private String source;

    @Column(name = "wellness_content_id", length = 20)
    private String wellnessContentId;

    @Column(name = "like_count")
    private Integer likeCount = 0;

    @Column(name = "scrap_count")
    private Integer scrapCount = 0;

    @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanPlace> planPlaces = new ArrayList<>();

    @Builder
    public Place(String source, String sourceId, String addressName, String roadAddressName, String categoryName,
                 String phone, String placeName, String placeUrl, String placeImageUrl, String wellnessContentId,
                 Double x, Double y,
                 LocalDateTime lastFetchedAt, LocalDateTime lastSeenAt) {
        this.source = source;
        this.sourceId = sourceId;
        this.addressName = addressName;
        this.roadAddressName = roadAddressName;
        this.categoryName = categoryName;
        this.phone = phone;
        this.placeName = placeName;
        this.placeUrl = placeUrl;
        this.placeImageUrl = placeImageUrl;
        this.wellnessContentId = wellnessContentId;
        this.x = x;
        this.y = y;
        this.lastFetchedAt = lastFetchedAt;
        this.lastSeenAt = lastSeenAt;
        this.likeCount = 0;
        this.scrapCount = 0;
    }

    public void mergeFrom(PlaceUpsertCommand cmd) {
        if (hasText(cmd.getAddressName())) this.addressName = cmd.getAddressName();
        if (hasText(cmd.getRoadAddressName())) this.roadAddressName = cmd.getRoadAddressName();
        if (hasText(cmd.getCategoryName())) this.categoryName = cmd.getCategoryName();
        if (hasText(cmd.getPhone())) this.phone = cmd.getPhone();
        if (hasText(cmd.getPlaceName())) this.placeName = cmd.getPlaceName();
        if (hasText(cmd.getPlaceUrl())) this.placeUrl = cmd.getPlaceUrl();
        if (cmd.getX() != null) this.x = cmd.getX();
        if (cmd.getY() != null) this.y = cmd.getY();
        if (hasText(cmd.getPlaceImageUrl())) this.placeImageUrl = cmd.getPlaceImageUrl();

        // 한 번 붙은 웰니스 식별자는 지우지 않는다. 이번 조회에서 안 걸렸을 뿐일 수 있다.
        if (hasText(cmd.getWellnessContentId())) this.wellnessContentId = cmd.getWellnessContentId();

        this.lastFetchedAt = LocalDateTime.now();
    }

    public void markSeen() {
        this.lastSeenAt = LocalDateTime.now();
    }

    public void increaseLikeCount() {
        this.likeCount++;
    }

    public void decreaseLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    public void increaseScrappedCount() {
        this.scrapCount++;
    }

    public void decreaseScrappedCount() {
        if (this.scrapCount > 0) {
            this.scrapCount--;
        }
    }

    private static Boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

}
