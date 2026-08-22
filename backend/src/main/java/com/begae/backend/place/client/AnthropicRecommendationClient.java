package com.begae.backend.place.client;

import com.anthropic.client.AnthropicClient;
import com.anthropic.errors.AnthropicException;
import com.anthropic.errors.AnthropicServiceException;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.component.PromptRegistry;
import com.begae.backend.place.dto.AiSelectionDto;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.NoSuchElementException;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnthropicRecommendationClient {

    private static final String MODEL = "claude-sonnet-4-5-20250929";

    private final AnthropicClient anthropicClient;
    private final ObjectMapper objectMapper;
    private final PromptRegistry promptRegistry;
    private final MeterRegistry meterRegistry;

    public AiSelectionDto select(String surveyJson, String candidateList, Duration timeout) {
        try {
            String userPrompt = promptRegistry.getUserTemplate()
                    .replace("{{SURVEY_JSON}}", surveyJson)
                    .replace("{{CANDIDATES}}", candidateList);

            MessageCreateParams params = MessageCreateParams.builder()
                    .model(MODEL)
                    .maxTokens(1500)
                    .system(promptRegistry.getSystemPrompt())
                    .addUserMessage(userPrompt)
                    .build();

            AnthropicClient requestClient = anthropicClient.withOptions(options -> options.timeout(timeout));
            Message message = requestClient.messages().create(params);
            String content = message.content().getFirst().asText().text()
                    .replace("```json\n", "")
                    .replace("```", "")
                    .trim();

            return objectMapper.readValue(content, AiSelectionDto.class);
        } catch (AnthropicServiceException exception) {
            recordFailure("service");
            log.warn("Anthropic recommendation request failed with status {}", exception.statusCode());
            throw new CustomException(PlaceErrorCode.RECOMMENDATION_SERVICE_UNAVAILABLE);
        } catch (AnthropicException exception) {
            recordFailure("connection");
            log.warn("Anthropic recommendation request failed: {}", exception.getClass().getSimpleName());
            throw new CustomException(PlaceErrorCode.RECOMMENDATION_SERVICE_UNAVAILABLE);
        } catch (JsonProcessingException | NoSuchElementException | IllegalStateException exception) {
            recordFailure("response");
            log.warn("Anthropic recommendation response could not be processed: {}", exception.getClass().getSimpleName());
            throw new CustomException(PlaceErrorCode.RECOMMENDATION_SERVICE_UNAVAILABLE);
        }
    }

    private void recordFailure(String reason) {
        meterRegistry.counter("ilchul.recommendation.failures", "reason", reason).increment();
    }
}
