package com.begae.backend.place.component;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * 설문 응답을 카카오 로컬 검색 파라미터로 바꾼다.
 *
 * 검색어 표(표 C)는 기획 확정값이며 cc/api/v2/place.md 5절과 동기화된다.
 * v1처럼 AI가 키워드를 생성하지 않으므로 AI 호출이 요청당 1회로 유지된다.
 */
@Component
public class SurveySearchPolicy {

    private static final String DEFAULT_EMOTION = "아무 감정도 없이 멍한 느낌이에요";

    private static final Map<String, List<String>> KEYWORDS = Map.of(
            "그냥 기운이 없고 지쳤어요",        List.of("온천", "사우나", "브런치카페", "공원"),
            "마음이 좀 울적하고 속상해요",      List.of("카페", "산책로", "서점", "전망대"),
            "답답하고 짜증이 많아졌어요",       List.of("등산로", "하천", "방탈출", "클라이밍"),
            "무기력하고 재미가 없어요",         List.of("전시회", "체험공방", "보드게임카페", "시장"),
            "기분이 좋아요, 뭔가 하고 싶어요",  List.of("맛집", "전시회", "산책로", "사진스팟"),
            "생각이 많아졌어요, 정리가 필요해요", List.of("서점", "북카페", "사찰", "도서관"),
            DEFAULT_EMOTION,                    List.of("수목원", "미술관", "카페", "강변")
    );

    /** 카카오 radius 상한 */
    private static final int MAX_RADIUS_M = 20000;
    private static final int MIN_HOURS = 1;
    private static final int MAX_HOURS = 12;

    private record RadiusRange(int min, int max) {}

    private static final Map<String, RadiusRange> RADIUS = Map.of(
            "도보",     new RadiusRange(500, 2000),
            "대중교통", new RadiusRange(2000, 5000),
            "자가용",   new RadiusRange(5000, 15000)
    );

    private static final RadiusRange DEFAULT_RADIUS = RADIUS.get("대중교통");

    public List<String> keywordsFor(String emotion) {
        // Map.of가 만드는 불변 맵은 null 키 조회에서 NPE를 던지므로 먼저 걸러낸다.
        if (emotion == null) {
            return KEYWORDS.get(DEFAULT_EMOTION);
        }
        return KEYWORDS.getOrDefault(emotion, KEYWORDS.get(DEFAULT_EMOTION));
    }

    public int radiusMeters(String transport, int totalHours) {
        RadiusRange range = transport == null ? DEFAULT_RADIUS : RADIUS.getOrDefault(transport, DEFAULT_RADIUS);
        int clamped = Math.max(MIN_HOURS, Math.min(MAX_HOURS, totalHours));
        double ratio = (double) (clamped - MIN_HOURS) / (MAX_HOURS - MIN_HOURS);
        int radius = (int) Math.round(range.min() + (range.max() - range.min()) * ratio);
        return Math.min(radius, MAX_RADIUS_M);
    }
}
