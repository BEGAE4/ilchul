package com.begae.backend.place.client;

import com.begae.backend.place.dto.WellnessPlaceDto;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * 한국관광공사 웰니스관광정보 API 클라이언트.
 *
 * DTO 대신 JsonNode로 받아 직접 매핑한다. 결과가 0건일 때 response.body.items가
 * 객체가 아니라 빈 문자열("")로 오기 때문에, 고정 DTO로 매핑하면 역직렬화 예외가 난다.
 *
 * 이 API는 부가 소스다. 어떤 실패도 예외로 전파하지 않고 빈 리스트로 degrade한다.
 */
@Slf4j
@Component
public class WellnessApiClient {

    private static final String PATH = "/locationBasedList";
    private static final String OK = "0000";
    private static final int MAX_ROWS = 30;

    private final WebClient tourWebClient;
    private final String serviceKey;

    public WellnessApiClient(@Qualifier("tourWebClient") WebClient tourWebClient,
                             @Value("${tour-api.service-key}") String serviceKey) {
        this.tourWebClient = tourWebClient;
        this.serviceKey = serviceKey;
    }

    public List<WellnessPlaceDto> findNearby(double x, double y, int radiusM) {
        try {
            JsonNode root = tourWebClient.get()
                    .uri(builder -> builder
                            .path(PATH)
                            .queryParam("serviceKey", serviceKey)
                            .queryParam("MobileOS", "ETC")
                            .queryParam("MobileApp", "ilchul")
                            .queryParam("_type", "json")
                            .queryParam("langDivCd", "KOR")
                            .queryParam("numOfRows", MAX_ROWS)
                            .queryParam("pageNo", 1)
                            .queryParam("mapX", x)
                            .queryParam("mapY", y)
                            .queryParam("radius", radiusM)
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            return parse(root);
        } catch (Exception e) {
            log.warn("웰니스 API 호출 실패 - 카카오 후보만으로 진행한다", e);
            return List.of();
        }
    }

    private List<WellnessPlaceDto> parse(JsonNode root) {
        if (root == null) return List.of();

        JsonNode header = root.path("response").path("header");
        if (!OK.equals(header.path("resultCode").asText())) {
            log.warn("웰니스 API 비정상 응답: {}", root.toString());
            return List.of();
        }

        // 0건이면 items가 빈 문자열이라 path("item")이 MissingNode가 된다
        JsonNode items = root.path("response").path("body").path("items").path("item");
        if (!items.isArray()) return List.of();

        List<WellnessPlaceDto> result = new ArrayList<>();
        for (JsonNode item : items) {
            String contentId = item.path("contentId").asText(null);
            String title = item.path("title").asText(null);
            String mapX = item.path("mapX").asText("");
            String mapY = item.path("mapY").asText("");
            if (contentId == null || title == null || mapX.isBlank() || mapY.isBlank()) continue;
            try {
                result.add(new WellnessPlaceDto(contentId, title,
                        Double.parseDouble(mapX), Double.parseDouble(mapY)));
            } catch (NumberFormatException ignored) {
                log.debug("웰니스 좌표 파싱 실패 contentId={}", contentId);
            }
        }
        return result;
    }
}
