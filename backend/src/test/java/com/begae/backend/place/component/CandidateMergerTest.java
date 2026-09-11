package com.begae.backend.place.component;

import com.begae.backend.place.dto.KakaoPlaceResponseDto;
import com.begae.backend.place.dto.PlaceCandidate;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CandidateMergerTest {

    private final CandidateMerger merger = new CandidateMerger();

    private PlaceCandidate candidate(String kakaoId, String wellnessContentId) {
        KakaoPlaceResponseDto.Document d = new KakaoPlaceResponseDto.Document();
        d.setId(kakaoId);
        d.setPlaceName("place-" + kakaoId);
        return new PlaceCandidate(d, wellnessContentId);
    }

    @Test
    void 웰니스_후보가_카카오_후보보다_앞에_온다() {
        List<PlaceCandidate> merged = merger.merge(
                List.of(candidate("W1", "1001")),
                List.of(candidate("K1", null), candidate("K2", null)));

        assertThat(merged).extracting(PlaceCandidate::getKakaoId)
                .containsExactly("W1", "K1", "K2");
    }

    @Test
    void 같은_카카오_id면_웰니스_쪽을_남긴다() {
        List<PlaceCandidate> merged = merger.merge(
                List.of(candidate("SAME", "1001")),
                List.of(candidate("SAME", null), candidate("K2", null)));

        assertThat(merged).hasSize(2);
        assertThat(merged.get(0).getKakaoId()).isEqualTo("SAME");
        assertThat(merged.get(0).getWellnessContentId()).isEqualTo("1001");
        assertThat(merged.get(0).isWellness()).isTrue();
    }

    @Test
    void 카카오_후보끼리의_중복도_제거한다() {
        List<PlaceCandidate> merged = merger.merge(
                List.of(),
                List.of(candidate("K1", null), candidate("K1", null), candidate("K2", null)));

        assertThat(merged).extracting(PlaceCandidate::getKakaoId).containsExactly("K1", "K2");
    }

    @Test
    void 웰니스가_없어도_카카오만으로_동작한다() {
        List<PlaceCandidate> merged = merger.merge(List.of(), List.of(candidate("K1", null)));

        assertThat(merged).hasSize(1);
        assertThat(merged.get(0).isWellness()).isFalse();
    }

    @Test
    void 양쪽_모두_비면_빈_리스트다() {
        assertThat(merger.merge(List.of(), List.of())).isEmpty();
    }
}
