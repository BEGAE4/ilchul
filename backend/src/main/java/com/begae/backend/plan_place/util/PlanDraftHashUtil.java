package com.begae.backend.plan_place.util;

import com.begae.backend.plan_place.dto.CreatePlanPreviewResponseDto;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;

public class PlanDraftHashUtil {

    private static final HexFormat HEX = HexFormat.of();

    public static String hashPlaces(List<CreatePlanPreviewResponseDto.Place> places) {
        try {
            // order 기준 정렬 → "placeId:order|placeId:order|..."
            String normalized = places.stream()
                    .sorted(Comparator.comparingInt(CreatePlanPreviewResponseDto.Place::getOrder))
                    .map(p -> p.getPlaceId() + ":" + p.getOrder())
                    .reduce((a, b) -> a + "|" + b)
                    .orElse("");

            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(normalized.getBytes(StandardCharsets.UTF_8));
            return HEX.formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash places", e);
        }
    }
}
