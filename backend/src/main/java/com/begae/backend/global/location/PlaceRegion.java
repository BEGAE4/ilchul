package com.begae.backend.global.location;

/** 저장 경계에서만 주소를 해석한다. 검색은 정규화된 컬럼을 사용한다. */
public record PlaceRegion(String sido, String sigungu) {
    public static PlaceRegion resolve(String sido, String sigungu, String address, String roadAddress) {
        String source = hasText(address) ? address : roadAddress;
        String[] parts = hasText(source) ? source.trim().split("\\s+") : new String[0];
        PopularRegion region = PopularRegion.from(hasText(sido) ? sido : parts.length > 0 ? parts[0] : null);
        if (region == PopularRegion.UNKNOWN) return new PlaceRegion(null, null);
        String district = hasText(sigungu) ? sigungu.trim() : null;
        if (district == null && parts.length > 1 && parts[1].matches(".*[시군구]$")) {
            district = parts[1];
            if (parts[1].endsWith("시") && parts.length > 2 && parts[2].endsWith("구")) {
                district += " " + parts[2];
            }
        }
        return new PlaceRegion(region.getSido(), district);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
