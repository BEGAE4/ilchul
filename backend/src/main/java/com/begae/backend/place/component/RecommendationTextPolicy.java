package com.begae.backend.place.component;

import java.util.regex.Pattern;

/** Bounded style/content checks; they cannot prove semantic grounding. */
public final class RecommendationTextPolicy {
    private static final Pattern UNSUPPORTED = Pattern.compile(
            "ignore|system|prompt|secret|instruction|api.?key|password|https?://|www\\.|시스템\\s*프롬프트|(?:지시|명령).*무시|API.?키|비밀번호|치료|완치|우울증|진단|예약.*가능|무료|영업.*중|운영.*시간|주차.*가능|반드시.*(?:방문|구매)",
            Pattern.CASE_INSENSITIVE);
    private RecommendationTextPolicy() {}

    public static boolean valid(String text, int maxLength) {
        if (text == null || text.isBlank()) return false;
        String value = text.trim();
        String[] sentences = value.split("(?<=[.!?。])\\s*");
        if (sentences.length > (maxLength == 40 ? 1 : 2)) return false;
        for (String sentence : sentences) if (!sentence.matches("(?s).*요[.!?。]?")) return false;
        return value.codePointCount(0, value.length()) <= maxLength
                && value.matches("(?s).*요[.!?。]?")
                && !value.contains("\n") && !value.contains("<") && !value.contains(">")
                && !UNSUPPORTED.matcher(value).find();
    }

    public static boolean validTag(String tag) {
        return tag != null && tag.matches("#[\\p{L}\\p{N}_]{1,19}") && !UNSUPPORTED.matcher(tag).find();
    }

    public static String reason(String text, String category) {
        if (valid(text, 40)) return text.trim();
        if (category != null && category.contains("카페")) return "잠시 쉬어가고 싶을 때 카페에 들러보세요.";
        if (category != null && (category.contains("공원") || category.contains("수목원")))
            return "가볍게 걸으며 쉬어갈 장소로 추천해 드려요.";
        if (category != null && (category.contains("미술") || category.contains("박물관")))
            return "전시를 살펴볼 장소로 추천해 드려요.";
        return "여행 중 잠시 들러볼 장소로 추천해 드려요.";
    }

    public static String reasoning(String text, boolean courseChanged) {
        if (!courseChanged && valid(text, 120)) return text.trim();
        return "출발지로 돌아오는 시간까지 고려해 둘러볼 장소를 골랐어요. 각 장소에서 잠시 쉬어가며 나만의 시간을 보내보세요.";
    }
}
