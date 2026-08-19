package com.begae.backend.place.component;

import com.begae.backend.place.dto.AiSelectionDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AiSelectionValidatorTest {

    private final AiSelectionValidator validator = new AiSelectionValidator();

    private AiSelectionDto.Selection selection(int index, int order) {
        AiSelectionDto.Selection s = new AiSelectionDto.Selection();
        s.setIndex(index);
        s.setOrder(order);
        s.setStayMinutes(60);
        s.setReason("이유");
        s.setTags(List.of("#태그"));
        return s;
    }

    private AiSelectionDto dto(List<AiSelectionDto.Selection> selections) {
        AiSelectionDto d = new AiSelectionDto();
        d.setSelections(selections);
        return d;
    }

    @Test
    void order대로_정렬하고_1부터_다시_번호를_매긴다() {
        List<AiSelectionDto.Selection> result = validator.validate(
                dto(List.of(selection(2, 7), selection(0, 3))), 5);

        assertThat(result).extracting(AiSelectionDto.Selection::getIndex).containsExactly(0, 2);
        assertThat(result).extracting(AiSelectionDto.Selection::getOrder).containsExactly(1, 2);
    }

    @Test
    void 후보_범위를_벗어난_인덱스는_버린다() {
        List<AiSelectionDto.Selection> result = validator.validate(
                dto(List.of(selection(0, 1), selection(99, 2), selection(-1, 3))), 5);

        assertThat(result).extracting(AiSelectionDto.Selection::getIndex).containsExactly(0);
    }

    @Test
    void 같은_인덱스를_두_번_고르면_먼저_것만_남긴다() {
        List<AiSelectionDto.Selection> result = validator.validate(
                dto(List.of(selection(1, 1), selection(1, 2))), 5);

        assertThat(result).hasSize(1);
    }

    @Test
    void 체류시간이_비정상이면_기본값_60분으로_보정한다() {
        AiSelectionDto.Selection zero = selection(0, 1);
        zero.setStayMinutes(0);
        AiSelectionDto.Selection huge = selection(1, 2);
        huge.setStayMinutes(9999);

        List<AiSelectionDto.Selection> result = validator.validate(dto(List.of(zero, huge)), 5);

        assertThat(result.get(0).getStayMinutes()).isEqualTo(60);
        assertThat(result.get(1).getStayMinutes()).isEqualTo(60);
    }

    @Test
    void selections가_null이면_빈_리스트다() {
        assertThat(validator.validate(dto(null), 5)).isEmpty();
    }

    @Test
    void 전부_무효하면_빈_리스트다() {
        assertThat(validator.validate(dto(List.of(selection(99, 1))), 5)).isEmpty();
    }
}
