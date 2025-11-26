package com.begae.backend.place.domain;

import com.begae.backend.global.domain.BaseEntity;
import com.begae.backend.place.dto.KakaoPlaceResponseDto;
import com.begae.backend.place.dto.PlaceSummaryDto;
import com.begae.backend.plan_place.domain.PlanPlace;
import jakarta.persistence.*;
import lombok.*;

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
    private int placeId;

    @Column(name = "source_id")
    private String sourceId;

    @Column(name = "address_name")
    private String addressName;

    @Column(name = "road_address_name")
    private String roadAddressName;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "place_name")
    private String placeName;

    @Column(name = "place_url")
    private String placeUrl;

    @Column(name = "place_image_url")
    private String placeImageUrl;

    @Column
    private String longitude;

    @Column
    private String latitude;

    @Column(name = "last_fetched_at")
    private LocalDateTime lastFetchedAt;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanPlace> planPlaces = new ArrayList<>();

    @Builder
    public Place(String sourceId, String addressName, String roadAddressName, String categoryName,
                 String phone, String placeName, String placeUrl, String placeImageUrl, String longitude, String latitude,
                 LocalDateTime lastFetchedAt, LocalDateTime lastSeenAt) {
        this.sourceId = sourceId;
        this.addressName = addressName;
        this.roadAddressName = roadAddressName;
        this.categoryName = categoryName;
        this.phone = phone;
        this.placeName = placeName;
        this.placeUrl = placeUrl;
        this.placeImageUrl = placeImageUrl;
        this.longitude = longitude;
        this.latitude = latitude;
        this.lastFetchedAt = lastFetchedAt;
        this.lastSeenAt = lastSeenAt;
    }

    public void mergeFrom(KakaoPlaceResponseDto.Document doc, PlaceSummaryDto dto) {
        if (hasText(doc.getAddressName())) this.addressName = doc.getAddressName();
        if (hasText(doc.getRoadAddressName())) this.roadAddressName = doc.getRoadAddressName();
        if (hasText(doc.getCategoryName())) this.categoryName = doc.getCategoryName();
        if (hasText(doc.getPhone())) this.phone = doc.getPhone();
        if (hasText(doc.getPlaceName())) this.placeName = doc.getPlaceName();
        if (hasText(doc.getPlaceUrl())) this.placeUrl = doc.getPlaceUrl();
        if (hasText(doc.getX())) this.longitude = doc.getX();
        if (hasText(doc.getY())) this.latitude = doc.getY();

        if (dto != null && hasText(dto.getPlaceImageUrl())) {
            this.placeImageUrl = dto.getPlaceImageUrl();
        }

        this.lastFetchedAt = LocalDateTime.now();
    }

    public void markSeen() {
        this.lastSeenAt = LocalDateTime.now();
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

}
