package com.begae.backend.place.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 웰니스 공공 API 응답 중 실제로 사용하는 값만 담는다.
 *
 * 정책상 웰니스 콘텐츠는 DB에 적재할 수 없다. title/x/y는 카카오로 같은 장소를 되찾기
 * 위한 조회 키로만 쓰이고 저장되지 않으며, 저장되는 것은 contentId 하나뿐이다.
 */
@Getter
@AllArgsConstructor
public class WellnessPlaceDto {
    private final String contentId;
    private final String title;
    private final double x;
    private final double y;
}
