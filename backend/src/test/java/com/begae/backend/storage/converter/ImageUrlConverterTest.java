package com.begae.backend.storage.converter;

import com.begae.backend.storage.config.S3StorageProperties;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ImageUrlConverterTest {

    private final ImageUrlConverter converter = new ImageUrlConverter(propertiesWithBaseUrl("https://cdn.il-chul.com/"));

    @Test
    void 환경변수_미치환으로_저장된_URL은_현재_base_URL로_다시_조합한다() {
        assertThat(converter.convertToEntityAttribute("${STORAGE_PUBLIC_URL}/plan/39/image/a.png"))
                .isEqualTo("https://cdn.il-chul.com/plan/39/image/a.png");
    }

    @Test
    void base_URL이_아직_설정되지_않았으면_미치환_URL은_null로_읽는다() {
        ImageUrlConverter unconfigured = new ImageUrlConverter(propertiesWithBaseUrl("${STORAGE_PUBLIC_URL}"));

        assertThat(unconfigured.convertToEntityAttribute("${STORAGE_PUBLIC_URL}/plan/39/image/a.png")).isNull();
    }

    @Test
    void 절대_http_URL은_그대로_읽는다() {
        assertThat(converter.convertToEntityAttribute("https://lh3.googleusercontent.com/p/a"))
                .isEqualTo("https://lh3.googleusercontent.com/p/a");
        assertThat(converter.convertToEntityAttribute("http://tong.visitkorea.or.kr/a.jpg"))
                .isEqualTo("http://tong.visitkorea.or.kr/a.jpg");
    }

    @Test
    void 렌더링할_수_없는_식별자나_빈_값은_null로_읽는다() {
        assertThat(converter.convertToEntityAttribute("img5")).isNull();
        assertThat(converter.convertToEntityAttribute("")).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
    }

    @Test
    void 저장할_때는_값을_바꾸지_않는다() {
        assertThat(converter.convertToDatabaseColumn("img5")).isEqualTo("img5");
    }

    private static S3StorageProperties propertiesWithBaseUrl(String publicBaseUrl) {
        return new S3StorageProperties(null, "bucket", "ap-northeast-2", publicBaseUrl);
    }
}
