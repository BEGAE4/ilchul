package com.begae.backend.cs_inquiry.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class SwaggerSnapshotContractTest {

    @Test
    void 프론트_Swagger_스냅샷이_문의_첨부_계약을_포함한다() throws Exception {
        Path snapshot = Path.of("../frontend/cc/api/swagger.local.json");
        assertThat(snapshot).exists();
        JsonNode paths = new ObjectMapper().readTree(Files.readString(snapshot)).path("paths");

        assertThat(paths.path("/api/cs-inquiry").path("post").path("responses").has("413")).isTrue();
        assertThat(paths.path("/api/cs-inquiry/{inquiryId}").has("get")).isTrue();
        assertThat(paths.path("/api/cs-inquiry/{inquiryId}/images/{imageId}").has("get")).isTrue();
        assertThat(paths.path("/api/plan/{planId}/images").path("post").path("requestBody")
                .path("content").has("multipart/form-data")).isTrue();
        assertThat(paths.path("/api/plan/{planId}/images").path("post").path("responses").has("413")).isTrue();
        assertThat(paths.path("/api/plan-place/{planPlaceId}/stamp").path("post").path("responses").has("413")).isTrue();
    }
}
