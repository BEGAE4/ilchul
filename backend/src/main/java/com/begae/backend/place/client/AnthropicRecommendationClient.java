package com.begae.backend.place.client;

import com.anthropic.client.AnthropicClient;
import com.anthropic.core.JsonValue;
import com.anthropic.errors.AnthropicException;
import com.anthropic.errors.AnthropicServiceException;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.StopReason;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.component.PromptRegistry;
import com.begae.backend.place.dto.AiSelectionDto;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnthropicRecommendationClient {
    public static final String PROMPT_VERSION = "2026-10-02-v1";
    private static final String MODEL = "claude-sonnet-4-5-20250929";
    private final AnthropicClient anthropicClient;
    private final ObjectMapper objectMapper;
    private final PromptRegistry promptRegistry;
    private final MeterRegistry meterRegistry;

    public AiSelectionDto select(String surveyJson, String candidateList, Duration timeout) {
        try {
            MessageCreateParams params = MessageCreateParams.builder().model(MODEL).maxTokens(1800)
                    .system(promptRegistry.getSystemPrompt()).addUserMessage(assemble(surveyJson, candidateList))
                    .putAdditionalBodyProperty("output_config", JsonValue.from(Map.of(
                            "format", Map.of("type", "json_schema", "schema", schema()))))
                    .build();
            AnthropicClient requestClient = anthropicClient.withOptions(options -> options.timeout(timeout).maxRetries(0));
            Message message = requestClient.messages().create(params);
            if (message.stopReason().isEmpty() || !message.stopReason().get().equals(StopReason.END_TURN)
                    || message.content().size() != 1 || !message.content().getFirst().isText())
                throw new IllegalStateException("Incomplete or non-text response");
            return parse(message.content().getFirst().asText().text());
        } catch (AnthropicServiceException exception) {
            recordFailure("service");
            log.warn("Recommendation provider status={}", exception.statusCode());
            throw new CustomException(PlaceErrorCode.RECOMMENDATION_SERVICE_UNAVAILABLE);
        } catch (AnthropicException exception) {
            recordFailure("connection");
            log.warn("Recommendation provider failure type={}", exception.getClass().getSimpleName());
            throw new CustomException(PlaceErrorCode.RECOMMENDATION_SERVICE_UNAVAILABLE);
        } catch (JsonProcessingException | IllegalArgumentException | IllegalStateException exception) {
            recordFailure("response");
            throw new CustomException(PlaceErrorCode.RECOMMENDATION_INVALID_RESPONSE);
        }
    }

    String assemble(String surveyJson, String candidatesJson) throws JsonProcessingException {
        var envelope = objectMapper.createObjectNode();
        envelope.set("survey", strictMapper().readTree(surveyJson));
        envelope.set("candidates", strictMapper().readTree(candidatesJson));
        String data = objectMapper.writeValueAsString(envelope);
        if (data.length() > 48000) throw new IllegalArgumentException("Input too large");
        // Fixed instructions are never expanded with replacement tokens from untrusted strings.
        return promptRegistry.getUserTemplate() + "\n" + data;
    }

    AiSelectionDto parse(String content) throws JsonProcessingException {
        if (content == null || content.length() > 16000) throw new IllegalArgumentException("Response too large");
        var root = strictMapper().readTree(content);
        fields(root, Set.of("travel_plan", "selections"));
        var plan = root.get("travel_plan");
        fields(plan, Set.of("total_hours", "estimated_place_count", "reasoning"));
        integer(plan.get("total_hours")); integer(plan.get("estimated_place_count")); text(plan.get("reasoning"));
        var selections = root.get("selections");
        if (!selections.isArray() || selections.size() > 5) throw new IllegalArgumentException("Invalid selections");
        for (var selection : selections) {
            fields(selection, Set.of("index", "order", "stay_minutes", "reason", "tags"));
            integer(selection.get("index")); integer(selection.get("order")); integer(selection.get("stay_minutes"));
            text(selection.get("reason"));
            var tags = selection.get("tags");
            if (!tags.isArray() || tags.size() > 3) throw new IllegalArgumentException("Invalid tags");
            tags.forEach(this::text);
        }
        return objectMapper.treeToValue(root, AiSelectionDto.class);
    }

    private ObjectMapper strictMapper() {
        return objectMapper.copy().enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
                .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);
    }
    private void fields(JsonNode node, Set<String> expected) {
        if (node == null || !node.isObject()) throw new IllegalArgumentException("Invalid object");
        Set<String> actual = new HashSet<>(); node.fieldNames().forEachRemaining(actual::add);
        if (!actual.equals(expected)) throw new IllegalArgumentException("Missing or unknown fields");
    }
    private void integer(JsonNode node) {
        if (node == null || !node.isIntegralNumber() || !node.canConvertToInt())
            throw new IllegalArgumentException("Invalid integer");
    }
    private void text(JsonNode node) {
        if (node == null || !node.isTextual() || node.textValue().length() > 1024)
            throw new IllegalArgumentException("Invalid string");
    }
    private Map<String, Object> schema() {
        var integer = Map.of("type", "integer");
        var string = Map.of("type", "string");
        var selection = objectSchema(Map.of("index", integer, "order", integer, "stay_minutes", integer,
                "reason", string, "tags", Map.of("type", "array", "items", string)));
        return objectSchema(Map.of("travel_plan", objectSchema(Map.of("total_hours", integer,
                        "estimated_place_count", integer, "reasoning", string)),
                "selections", Map.of("type", "array", "items", selection)));
    }
    private Map<String, Object> objectSchema(Map<String, ?> properties) {
        return Map.of("type", "object", "properties", properties, "required", List.copyOf(properties.keySet()),
                "additionalProperties", false);
    }
    public void recordQuality(String outcome) {
        meterRegistry.counter("ilchul.recommendation.quality", "outcome", outcome, "prompt_version", PROMPT_VERSION).increment();
    }
    private void recordFailure(String reason) {
        meterRegistry.counter("ilchul.recommendation.failures", "reason", reason, "prompt_version", PROMPT_VERSION).increment();
    }
}
