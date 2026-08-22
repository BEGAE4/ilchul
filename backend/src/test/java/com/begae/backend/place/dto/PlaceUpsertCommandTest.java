package com.begae.backend.place.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PlaceUpsertCommandTest {

    private KakaoPlaceResponseDto.Document doc() {
        KakaoPlaceResponseDto.Document d = new KakaoPlaceResponseDto.Document();
        d.setId("12345");
        d.setPlaceName("우리유황온천");
        d.setAddressName("서울 광진구 자양동 12-3");
        d.setRoadAddressName("서울 광진구 자양로5길 33");
        d.setCategoryName("관광,명소 > 온천,사우나");
        d.setPhone("02-000-0000");
        d.setPlaceUrl("http://place.map.kakao.com/12345");
        d.setX("127.0812");
        d.setY("37.5372");
        return d;
    }

    @Test
    void 카카오_문서를_출처가_KAKAO인_명령으로_바꾼다() {
        PlaceUpsertCommand cmd = PlaceUpsertCommand.fromKakao(doc(), null, null);

        assertThat(cmd.getSource()).isEqualTo("KAKAO");
        assertThat(cmd.getSourceId()).isEqualTo("12345");
        assertThat(cmd.getPlaceName()).isEqualTo("우리유황온천");
        assertThat(cmd.getX()).isEqualTo(127.0812);
        assertThat(cmd.getY()).isEqualTo(37.5372);
        assertThat(cmd.getWellnessContentId()).isNull();
    }

    @Test
    void 웰니스_식별자가_있으면_그대로_실린다() {
        PlaceUpsertCommand cmd = PlaceUpsertCommand.fromKakao(doc(), null, "2932122");

        assertThat(cmd.getWellnessContentId()).isEqualTo("2932122");
        assertThat(cmd.getSource()).isEqualTo("KAKAO");
    }

    @Test
    void 요약정보가_있으면_카테고리와_이미지를_요약값으로_덮는다() {
        PlaceSummaryDto summary = PlaceSummaryDto.builder()
                .categoryName("관광,명소· 온천,사우나")
                .placeName("우리유황온천")
                .placeImageUrl("https://example.com/photo.jpg")
                .x("127.0812")
                .y("37.5372")
                .build();

        PlaceUpsertCommand cmd = PlaceUpsertCommand.fromKakao(doc(), summary, null);

        assertThat(cmd.getCategoryName()).isEqualTo("관광,명소· 온천,사우나");
        assertThat(cmd.getPlaceImageUrl()).isEqualTo("https://example.com/photo.jpg");
    }
}
