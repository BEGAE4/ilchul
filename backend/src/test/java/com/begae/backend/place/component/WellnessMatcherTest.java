package com.begae.backend.place.component;

import com.begae.backend.place.dto.KakaoPlaceResponseDto;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class WellnessMatcherTest {

    private final WellnessMatcher matcher = new WellnessMatcher();

    private KakaoPlaceResponseDto.Document doc(String id, String x, String y) {
        KakaoPlaceResponseDto.Document d = new KakaoPlaceResponseDto.Document();
        d.setId(id);
        d.setX(x);
        d.setY(y);
        return d;
    }

    @Test
    void 위도_0_01도_차이는_약_1112미터다() {
        double d = matcher.distanceMeters(127.0, 37.0, 127.0, 37.01);
        assertThat(d).isCloseTo(1112.0, within(5.0));
    }

    @Test
    void 같은_좌표면_0미터다() {
        assertThat(matcher.distanceMeters(127.0, 37.0, 127.0, 37.0)).isCloseTo(0.0, within(0.01));
    }

    @Test
    void 임계값_안에서_가장_가까운_한_건을_고른다() {
        List<KakaoPlaceResponseDto.Document> docs = List.of(
                doc("far", "127.0", "37.0100"),   // 약 1112m
                doc("near", "127.0", "37.0005"),  // 약 56m
                doc("mid", "127.0", "37.0010")    // 약 111m
        );
        Optional<KakaoPlaceResponseDto.Document> found = matcher.nearest(127.0, 37.0, docs);
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo("near");
    }

    @Test
    void 임계값_150미터_밖만_있으면_비어있다() {
        List<KakaoPlaceResponseDto.Document> docs = List.of(doc("far", "127.0", "37.0100"));
        assertThat(matcher.nearest(127.0, 37.0, docs)).isEmpty();
    }

    @Test
    void 후보가_비면_비어있다() {
        assertThat(matcher.nearest(127.0, 37.0, List.of())).isEmpty();
    }

    @Test
    void 좌표가_깨진_후보는_건너뛴다() {
        List<KakaoPlaceResponseDto.Document> docs = List.of(
                doc("broken", "", null),
                doc("near", "127.0", "37.0005")
        );
        assertThat(matcher.nearest(127.0, 37.0, docs))
                .map(KakaoPlaceResponseDto.Document::getId)
                .contains("near");
    }
}
