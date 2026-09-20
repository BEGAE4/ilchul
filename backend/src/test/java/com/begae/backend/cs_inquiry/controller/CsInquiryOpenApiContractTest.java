package com.begae.backend.cs_inquiry.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CsInquiryOpenApiContractTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void 문의_첨부_계약을_OpenAPI에_노출한다() throws Exception {
        String body = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode paths = objectMapper.readTree(body).path("paths");

        assertThat(paths.path("/api/cs-inquiry").path("post").path("requestBody")
                .path("content").has("multipart/form-data")).isTrue();
        assertThat(paths.path("/api/cs-inquiry").path("post").path("responses").has("413")).isTrue();
        assertThat(paths.path("/api/cs-inquiry/{inquiryId}").has("get")).isTrue();
        assertThat(paths.path("/api/cs-inquiry/{inquiryId}").path("patch").path("responses").has("413")).isTrue();
        assertThat(paths.path("/api/cs-inquiry/{inquiryId}/images/{imageId}").has("get")).isTrue();
        assertThat(paths.path("/api/plan/{planId}/images").path("post").path("requestBody")
                .path("content").has("multipart/form-data")).isTrue();
        assertThat(paths.path("/api/plan/{planId}/images").path("post").path("responses").has("413")).isTrue();
        assertThat(paths.path("/api/plan-place/{planPlaceId}/stamp").path("post").path("responses").has("413")).isTrue();
    }
}
