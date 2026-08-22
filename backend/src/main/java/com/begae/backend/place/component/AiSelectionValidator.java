package com.begae.backend.place.component;

import com.begae.backend.place.dto.AiSelectionDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * AI 선택 결과를 신뢰하지 않고 검증한다.
 *
 * 모델은 후보에 없는 인덱스, 중복 인덱스, 비현실적인 체류시간을 반환할 수 있다.
 * 잘못된 항목은 버리고 나머지로 진행한다. 전부 버려지면 호출부가 422로 응답한다.
 */
@Slf4j
@Component
public class AiSelectionValidator {

    private static final int DEFAULT_STAY_MINUTES = 60;
    private static final int MIN_STAY_MINUTES = 30;
    private static final int MAX_STAY_MINUTES = 90;
    private static final int MAX_SELECTIONS = 5;
    private static final int MAX_REASON_LENGTH = 40;
    private static final int MAX_TAGS = 3;
    private static final int MAX_TAG_LENGTH = 20;

    public List<AiSelectionDto.Selection> validate(
            AiSelectionDto dto, int candidateCount, int availableMinutes) {
        if (dto == null || dto.getSelections() == null
                || candidateCount <= 0 || availableMinutes < MIN_STAY_MINUTES) {
            return List.of();
        }

        List<AiSelectionDto.Selection> sorted = dto.getSelections().stream()
                .filter(selection -> selection != null)
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
        sorted.sort(Comparator.comparingInt(AiSelectionDto.Selection::getOrder));

        List<AiSelectionDto.Selection> valid = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();
        int usedMinutes = 0;

        for (AiSelectionDto.Selection s : sorted) {
            if (valid.size() >= MAX_SELECTIONS) break;

            if (s.getIndex() < 0 || s.getIndex() >= candidateCount) {
                log.warn("AI가 후보 범위 밖 인덱스를 반환해 버린다: index={}, candidateCount={}",
                        s.getIndex(), candidateCount);
                continue;
            }
            if (seen.contains(s.getIndex())) {
                log.warn("AI가 같은 후보를 중복 선택해 버린다: index={}", s.getIndex());
                continue;
            }
            if (s.getStayMinutes() < MIN_STAY_MINUTES || s.getStayMinutes() > MAX_STAY_MINUTES) {
                s.setStayMinutes(DEFAULT_STAY_MINUTES);
            }

            if (usedMinutes + s.getStayMinutes() > availableMinutes) {
                log.warn("AI 선택의 체류시간이 가용 시간을 넘어 버린다: index={}, stayMinutes={}",
                        s.getIndex(), s.getStayMinutes());
                continue;
            }

            s.setReason(sanitizeReason(s.getReason()));
            s.setTags(sanitizeTags(s.getTags()));
            s.setOrder(valid.size() + 1);
            seen.add(s.getIndex());
            valid.add(s);
            usedMinutes += s.getStayMinutes();
        }
        return valid;
    }

    private String sanitizeReason(String reason) {
        String value = reason == null || reason.isBlank() ? "추천 장소입니다." : reason.trim();
        return truncate(value, MAX_REASON_LENGTH);
    }

    private List<String> sanitizeTags(List<String> tags) {
        if (tags == null) return List.of();

        Set<String> unique = new LinkedHashSet<>();
        for (String tag : tags) {
            if (tag == null) continue;
            String value = tag.trim();
            if (value.length() <= 1 || !value.startsWith("#")) continue;
            unique.add(truncate(value, MAX_TAG_LENGTH));
            if (unique.size() >= MAX_TAGS) break;
        }
        return List.copyOf(unique);
    }

    private String truncate(String value, int maxCodePoints) {
        if (value.codePointCount(0, value.length()) <= maxCodePoints) return value;
        return value.substring(0, value.offsetByCodePoints(0, maxCodePoints));
    }
}
