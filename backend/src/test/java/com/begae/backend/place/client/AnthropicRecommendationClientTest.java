package com.begae.backend.place.client;

import com.anthropic.client.AnthropicClient;
import com.anthropic.errors.AnthropicIoException;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.services.blocking.MessageService;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.component.PromptRegistry;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AnthropicRecommendationClientTest {

    @Test
    void anthropicFailureIsMappedToServiceUnavailable() {
        AnthropicClient anthropicClient = mock(AnthropicClient.class);
        MessageService messageService = mock(MessageService.class);
        PromptRegistry promptRegistry = mock(PromptRegistry.class);
        when(anthropicClient.withOptions(any())).thenReturn(anthropicClient);
        when(anthropicClient.messages()).thenReturn(messageService);
        when(messageService.create(any(MessageCreateParams.class)))
                .thenThrow(new AnthropicIoException("upstream unavailable"));
        when(promptRegistry.getSystemPrompt()).thenReturn("system");
        when(promptRegistry.getUserTemplate()).thenReturn("survey={{SURVEY_JSON}} candidates={{CANDIDATES}}");
        SimpleMeterRegistry meterRegistry = new SimpleMeterRegistry();

        AnthropicRecommendationClient client = new AnthropicRecommendationClient(
                anthropicClient,
                new ObjectMapper(),
                promptRegistry,
                meterRegistry
        );

        assertThatThrownBy(() -> client.select("{}", "[0] candidate", Duration.ofSeconds(5)))
                .isInstanceOfSatisfying(CustomException.class, exception ->
                        assertThat(exception.getErrorCode())
                                .isEqualTo(PlaceErrorCode.RECOMMENDATION_SERVICE_UNAVAILABLE));
        assertThat(meterRegistry.counter("ilchul.recommendation.failures", "reason", "connection").count())
                .isEqualTo(1.0);
    }
}
