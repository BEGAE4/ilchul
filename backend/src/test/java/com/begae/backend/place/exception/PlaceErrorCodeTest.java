package com.begae.backend.place.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

class PlaceErrorCodeTest {

    @Test
    void 없는_장소는_404로_응답한다() {
        assertThat(PlaceErrorCode.PLACE_NOT_FOUND.getHttpStatus()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
