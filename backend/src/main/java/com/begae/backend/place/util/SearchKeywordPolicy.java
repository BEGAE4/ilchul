package com.begae.backend.place.util;

import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class SearchKeywordPolicy {

    private static final int MIN_LENGTH = 2;
    private static final int MAX_LENGTH = 30;

    private static final Set<String> FORBIDDEN_KEYWORDS = Set.of(
            "<금칙어1>",
            "<금칙어2>",
            "<금칙어3>"
    );

    public String normalize(String keyword) {
        if (keyword == null) {
            return "";
        }

        return keyword.trim().replaceAll("\\s+", " ");
    }

    public boolean isRecordable(String keyword) {
        String normalized = normalize(keyword);

        if (normalized.isBlank()) {
            return false;
        }

        if (normalized.length() < MIN_LENGTH) {
            return false;
        }

        if (normalized.length() > MAX_LENGTH) {
            return false;
        }

        return FORBIDDEN_KEYWORDS.stream()
                .noneMatch(normalized::contains);
    }
}
