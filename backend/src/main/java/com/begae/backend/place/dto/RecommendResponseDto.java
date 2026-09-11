package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * PLACE-16 v2 응답. 최상위가 객체인 이유는 plan·candidateCount처럼
 * 항목 리스트 바깥에 속하는 정보를 실을 자리가 필요하기 때문이다.
 *
 * source/fallback 필드는 두지 않는다. 웰니스와 카카오를 병합하는 구조에서는
 * "웰니스 경로 vs 폴백 경로"라는 이분법이 성립하지 않는다.
 */
@Getter
@Builder
public class RecommendResponseDto {

    private final String recommendId;
    private final CandidateCount candidateCount;
    private final Plan plan;
    private final List<Item> items;

    @Getter
    @Builder
    public static class CandidateCount {
        private final int wellness;
        private final int kakao;
    }

    @Getter
    @Builder
    public static class Plan {
        private final int totalHours;
        private final int estimatedPlaceCount;
        private final String reasoning;
    }

    @Getter
    @Builder
    public static class Item {
        private final int order;
        private final int placeId;
        private final String placeName;
        private final String categoryName;
        private final String placeImageUrl;
        private final String roadAddressName;
        private final double x;
        private final double y;
        private final int stayMinutes;
        private final String reason;
        private final List<String> tags;
        /** 프론트의 isVerified(방문 사진 인증)와 다른 개념이다. 출처가 웰니스 인증 장소인지를 뜻한다. */
        private final boolean wellnessCertified;
    }
}
