package com.begae.backend.global.location;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Getter
public enum PopularRegion {

    SEOUL(List.of("서울"), Set.of("서울", "서울특별시")),
    BUSAN(List.of("부산"), Set.of("부산", "부산광역시")),
    DAEGU(List.of("대구"), Set.of("대구", "대구광역시")),
    INCHEON(List.of("인천"), Set.of("인천", "인천광역시")),
    GWANGJU(List.of("광주"), Set.of("광주", "광주광역시")),
    DAEJEON(List.of("대전"), Set.of("대전", "대전광역시")),
    ULSAN(List.of("울산"), Set.of("울산", "울산광역시")),
    SEJONG(List.of("세종"), Set.of("세종", "세종특별자치시")),
    GYEONGGI(List.of("경기"), Set.of("경기", "경기도")),
    GANGWON(List.of("강원"), Set.of("강원", "강원도", "강원특별자치도")),
    CHUNGBUK(List.of("충북", "충청북"), Set.of("충북", "충청북도")),
    CHUNGNAM(List.of("충남", "충청남"), Set.of("충남", "충청남도")),
    JEONBUK(List.of("전북", "전라북"), Set.of("전북", "전라북도", "전북특별자치도")),
    JEONNAM(List.of("전남", "전라남"), Set.of("전남", "전라남도")),
    GYEONGBUK(List.of("경북", "경상북"), Set.of("경북", "경상북도")),
    GYEONGNAM(List.of("경남", "경상남"), Set.of("경남", "경상남도")),
    JEJU(List.of("제주"), Set.of("제주", "제주도", "제주특별자치도"));

    private final List<String> addressPrefixes;
    private final Set<String> acceptedNames;

    PopularRegion(List<String> addressPrefixes, Set<String> acceptedNames) {
        this.addressPrefixes = addressPrefixes;
        this.acceptedNames = acceptedNames;
    }

    public static PopularRegion from(String value) {
        String normalized = value == null ? "" : value.trim();
        return Arrays.stream(values())
                .filter(region -> region.acceptedNames.contains(normalized))
                .findFirst()
                .orElseThrow(() -> new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE));
    }
}
