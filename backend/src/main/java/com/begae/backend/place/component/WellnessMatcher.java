package com.begae.backend.place.component;

import com.begae.backend.place.dto.KakaoPlaceResponseDto;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * 웰니스 공공 API 장소를 카카오 POI로 되찾을 때 동일 장소인지 판정한다.
 *
 * 웰니스 콘텐츠는 DB에 적재할 수 없으므로(정책) place 행은 카카오 출처로 채워야 하고,
 * 그 연결 고리가 이 좌표 매칭이다.
 */
@Component
public class WellnessMatcher {

    /** 동일 장소로 인정할 최대 거리. 실측 데이터가 없어 운영 로그를 보고 조정한다. */
    public static final double MATCH_THRESHOLD_M = 150.0;

    private static final double EARTH_RADIUS_M = 6_371_000.0;

    public double distanceMeters(double x1, double y1, double x2, double y2) {
        double lat1 = Math.toRadians(y1);
        double lat2 = Math.toRadians(y2);
        double dLat = lat2 - lat1;
        double dLon = Math.toRadians(x2 - x1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1.0, Math.sqrt(a)));
    }

    public Optional<KakaoPlaceResponseDto.Document> nearest(
            double x, double y, List<KakaoPlaceResponseDto.Document> documents) {

        if (documents == null || documents.isEmpty()) return Optional.empty();

        return documents.stream()
                .filter(this::hasCoordinates)
                .filter(d -> distanceTo(x, y, d) <= MATCH_THRESHOLD_M)
                .min(Comparator.comparingDouble(d -> distanceTo(x, y, d)));
    }

    private boolean hasCoordinates(KakaoPlaceResponseDto.Document d) {
        return d.getX() != null && !d.getX().isBlank()
                && d.getY() != null && !d.getY().isBlank();
    }

    private double distanceTo(double x, double y, KakaoPlaceResponseDto.Document d) {
        return distanceMeters(x, y, Double.parseDouble(d.getX()), Double.parseDouble(d.getY()));
    }
}
