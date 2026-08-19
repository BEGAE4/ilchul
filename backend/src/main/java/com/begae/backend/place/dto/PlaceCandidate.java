package com.begae.backend.place.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * AI에게 넘길 후보 1건.
 *
 * 장소 데이터는 전부 카카오 출처(document)이고, 웰니스는 식별자만 붙는다.
 * wellnessContentId가 null이 아니면 힐링 인증 배지 대상이다.
 */
@Getter
@AllArgsConstructor
public class PlaceCandidate {

    private final KakaoPlaceResponseDto.Document document;
    private final String wellnessContentId;

    public boolean isWellness() {
        return wellnessContentId != null;
    }

    public String getKakaoId() {
        return document.getId();
    }
}
