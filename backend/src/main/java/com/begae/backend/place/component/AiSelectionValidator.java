package com.begae.backend.place.component;

import com.begae.backend.place.dto.AiSelectionDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
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
    private static final int MIN_STAY_MINUTES = 15;
    private static final int MAX_STAY_MINUTES = 240;

    public List<AiSelectionDto.Selection> validate(AiSelectionDto dto, int candidateCount) {
        if (dto == null || dto.getSelections() == null) return List.of();

        List<AiSelectionDto.Selection> sorted = new ArrayList<>(dto.getSelections());
        sorted.sort(Comparator.comparingInt(AiSelectionDto.Selection::getOrder));

        List<AiSelectionDto.Selection> valid = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();

        for (AiSelectionDto.Selection s : sorted) {
            if (s.getIndex() < 0 || s.getIndex() >= candidateCount) {
                log.warn("AI가 후보 범위 밖 인덱스를 반환해 버린다: index={}, candidateCount={}",
                        s.getIndex(), candidateCount);
                continue;
            }
            if (!seen.add(s.getIndex())) {
                log.warn("AI가 같은 후보를 중복 선택해 버린다: index={}", s.getIndex());
                continue;
            }
            if (s.getStayMinutes() < MIN_STAY_MINUTES || s.getStayMinutes() > MAX_STAY_MINUTES) {
                s.setStayMinutes(DEFAULT_STAY_MINUTES);
            }
            if (s.getTags() == null) {
                s.setTags(List.of());
            }
            s.setOrder(valid.size() + 1);
            valid.add(s);
        }
        return valid;
    }
}
