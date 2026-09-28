package com.begae.backend.global.location;

import com.begae.backend.place.repository.PlaceRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;
import java.util.Arrays;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class RegionController {
    private final PlaceRepository placeRepository;

    public record District(String sigungu, long placeCount) {}
    public record Region(String region, String name, List<String> aliases, long placeCount, List<District> sigungu) {}
    public record Response(List<Region> regions) {}

    @GetMapping("/api/region")
    @Transactional(readOnly = true)
    @Operation(summary = "지역 목록과 장소 수", description = "지역 선택용 코드와 이름, 별칭, 공개 인기 장소 수 및 데이터가 있는 시군구 목록을 반환합니다. 장소가 없는 시도도 포함합니다.")
    public Response getRegions() {
        var counts = placeRepository.countPlacesByRegion();
        return new Response(Arrays.stream(PopularRegion.values())
                .filter(region -> region != PopularRegion.UNKNOWN)
                .map(region -> {
                    var rows = counts.stream().filter(row -> region.getSido().equals(row.getSido())).toList();
                    var districts = rows.stream().filter(row -> row.getSigungu() != null)
                            .map(row -> new District(row.getSigungu(), row.getPlaceCount()))
                            .sorted(java.util.Comparator.comparing(District::sigungu)).toList();
                    return new Region(region.getSido(), region.getDisplayName(),
                            region.getAcceptedNames().stream().sorted().toList(),
                            rows.stream().mapToLong(PlaceRepository.RegionCount::getPlaceCount).sum(), districts);
                }).toList());
    }
}
