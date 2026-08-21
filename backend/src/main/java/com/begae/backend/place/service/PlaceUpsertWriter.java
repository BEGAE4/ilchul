package com.begae.backend.place.service;

import com.begae.backend.place.domain.Place;
import com.begae.backend.place.dto.PlaceUpsertCommand;
import com.begae.backend.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * place upsert의 실제 DB 트랜잭션을 담당한다.
 *
 * 최초 insert 경합이 실패한 트랜잭션과 충돌 복구 트랜잭션을 분리해야
 * rollback-only 상태에서 조회·병합을 시도하지 않는다.
 */
@Component
@RequiredArgsConstructor
public class PlaceUpsertWriter {

    private final PlaceRepository placeRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int insertOrMerge(PlaceUpsertCommand command) {
        LocalDateTime now = LocalDateTime.now();
        return placeRepository.findPlaceBySourceAndSourceId(command.getSource(), command.getSourceId())
                .map(place -> mergeExisting(place, command, now))
                .orElseGet(() -> insert(command, now));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int mergeAfterConflict(PlaceUpsertCommand command) {
        Place existing = placeRepository
                .findPlaceBySourceAndSourceId(command.getSource(), command.getSourceId())
                .orElseThrow(() -> new IllegalStateException(
                        "place unique 충돌 후 기존 행을 찾지 못했습니다."));
        return mergeExisting(existing, command, LocalDateTime.now());
    }

    private int insert(PlaceUpsertCommand command, LocalDateTime now) {
        Place newPlace = Place.builder()
                .source(command.getSource())
                .sourceId(command.getSourceId())
                .addressName(command.getAddressName())
                .roadAddressName(command.getRoadAddressName())
                .categoryName(command.getCategoryName())
                .phone(command.getPhone())
                .placeName(command.getPlaceName())
                .placeUrl(command.getPlaceUrl())
                .placeImageUrl(command.getPlaceImageUrl())
                .wellnessContentId(command.getWellnessContentId())
                .x(command.getX())
                .y(command.getY())
                .lastFetchedAt(now)
                .lastSeenAt(now)
                .build();
        placeRepository.saveAndFlush(newPlace);
        return newPlace.getPlaceId();
    }

    private int mergeExisting(Place place, PlaceUpsertCommand command, LocalDateTime now) {
        if (place.getLastSeenAt() == null || place.getLastSeenAt().isBefore(now.minusHours(6))) {
            place.markSeen();
        }

        boolean stale = place.getLastFetchedAt() == null
                || place.getLastFetchedAt().isBefore(now.minusDays(7));
        boolean needsWellnessLink = command.getWellnessContentId() != null
                && place.getWellnessContentId() == null;

        if (stale || needsWellnessLink) {
            place.mergeFrom(command);
        }
        return place.getPlaceId();
    }
}
