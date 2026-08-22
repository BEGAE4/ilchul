package com.begae.backend.place.component;

import com.begae.backend.place.dto.AiSelectionDto;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
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
                dto(List.of(selection(2, 7), selection(0, 3))), 5, 300);

        assertThat(result).extracting(AiSelectionDto.Selection::getIndex).containsExactly(0, 2);
        assertThat(result).extracting(AiSelectionDto.Selection::getOrder).containsExactly(1, 2);
    }

    @Test
    void 후보_범위를_벗어난_인덱스는_버린다() {
        List<AiSelectionDto.Selection> result = validator.validate(
                dto(List.of(selection(0, 1), selection(99, 2), selection(-1, 3))), 5, 300);

        assertThat(result).extracting(AiSelectionDto.Selection::getIndex).containsExactly(0);
    }

    @Test
    void 같은_인덱스를_두_번_고르면_먼저_것만_남긴다() {
        List<AiSelectionDto.Selection> result = validator.validate(
                dto(List.of(selection(1, 1), selection(1, 2))), 5, 300);

        assertThat(result).hasSize(1);
    }

    @Test
    void 체류시간이_비정상이면_기본값_60분으로_보정한다() {
        AiSelectionDto.Selection zero = selection(0, 1);
        zero.setStayMinutes(0);
        AiSelectionDto.Selection huge = selection(1, 2);
        huge.setStayMinutes(9999);

        List<AiSelectionDto.Selection> result = validator.validate(dto(List.of(zero, huge)), 5, 300);

        assertThat(result.get(0).getStayMinutes()).isEqualTo(60);
        assertThat(result.get(1).getStayMinutes()).isEqualTo(60);
    }

    @Test
    void selections가_null이면_빈_리스트다() {
        assertThat(validator.validate(dto(null), 5, 300)).isEmpty();
    }

    @Test
    void 전부_무효하면_빈_리스트다() {
        assertThat(validator.validate(dto(List.of(selection(99, 1))), 5, 300)).isEmpty();
    }

    @Test
    void 최대_다섯_곳까지만_선택한다() {
        List<AiSelectionDto.Selection> selections = new ArrayList<>();
        for (int i = 0; i < 7; i++) selections.add(selection(i, i + 1));

        assertThat(validator.validate(dto(selections), 7, 600)).hasSize(5);
    }

    @Test
    void 총_체류시간이_가용시간을_넘는_선택은_버린다() {
        List<AiSelectionDto.Selection> selections = List.of(
                selection(0, 1), selection(1, 2), selection(2, 3), selection(3, 4));

        assertThat(validator.validate(dto(selections), 4, 180)).hasSize(3);
    }

    @Test
    void 시간초과로_버린_후보의_짧은_중복선택은_사용할_수_있다() {
        AiSelectionDto.Selection tooLong = selection(0, 1);
        tooLong.setStayMinutes(90);
        AiSelectionDto.Selection fits = selection(0, 2);
        fits.setStayMinutes(30);

        List<AiSelectionDto.Selection> result = validator.validate(
                dto(List.of(tooLong, fits)), 1, 30);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getStayMinutes()).isEqualTo(30);
    }

    @Test
    void null_항목과_과도한_문장_태그를_안전하게_정리한다() {
        AiSelectionDto.Selection selection = selection(0, 1);
        selection.setReason("가".repeat(50));
        selection.setTags(List.of("#첫째", "태그아님", "#둘째", "#셋째", "#넷째"));
        List<AiSelectionDto.Selection> selections = new ArrayList<>();
        selections.add(null);
        selections.add(selection);

        List<AiSelectionDto.Selection> result = validator.validate(dto(selections), 1, 120);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getReason().codePointCount(0, result.getFirst().getReason().length()))
                .isEqualTo(40);
        assertThat(result.getFirst().getTags()).containsExactly("#첫째", "#둘째", "#셋째");
    }
}
