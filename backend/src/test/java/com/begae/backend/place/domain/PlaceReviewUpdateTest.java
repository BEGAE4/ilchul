package com.begae.backend.place.domain;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class PlaceReviewUpdateTest {

    @Test
    void 후기_내용을_수정한다() throws Exception {
        PlaceReview review = PlaceReview.builder().content("수정 전").build();
        Method update = PlaceReview.class.getMethod("updateContent", String.class);

        update.invoke(review, "수정 후");

        assertThat(review.getContent()).isEqualTo("수정 후");
    }
}
