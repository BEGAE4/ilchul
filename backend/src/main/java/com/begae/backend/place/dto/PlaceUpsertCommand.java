package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * place 테이블 upsert 입력. 특정 외부 API DTO에 묶이지 않는다.
 *
 * 기존 upsertPlaceFrom은 KakaoPlaceResponseDto.Document를 직접 받아 출처가 늘어날 때마다
 * 시그니처가 흔들렸다. 출처 중립 명령 객체로 그 결합을 끊는다.
 */
@Getter
@Builder
public class PlaceUpsertCommand {

    public static final String SOURCE_KAKAO = "KAKAO";

    private final String source;
    private final String sourceId;
    private final String placeName;
    private final String addressName;
    private final String roadAddressName;
    private final String categoryName;
    private final String phone;
    private final String placeUrl;
    private final String placeImageUrl;
    private final Double x;
    private final Double y;
    /** 웰니스 인증 장소일 때만 채운다. 배지 판정 근거이자 저장하는 유일한 웰니스 데이터다. */
    private final String wellnessContentId;

    public static PlaceUpsertCommand fromKakao(KakaoPlaceResponseDto.Document doc,
                                               PlaceSummaryDto summary,
                                               String wellnessContentId) {
        return PlaceUpsertCommand.builder()
                .source(SOURCE_KAKAO)
                .sourceId(doc.getId())
                .placeName(doc.getPlaceName())
                .addressName(doc.getAddressName())
                .roadAddressName(doc.getRoadAddressName())
                .categoryName(summary != null && summary.getCategoryName() != null
                        ? summary.getCategoryName() : doc.getCategoryName())
                .phone(doc.getPhone())
                .placeUrl(doc.getPlaceUrl())
                .placeImageUrl(summary != null ? summary.getPlaceImageUrl() : null)
                .x(parse(doc.getX()))
                .y(parse(doc.getY()))
                .wellnessContentId(wellnessContentId)
                .build();
    }

    private static Double parse(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
