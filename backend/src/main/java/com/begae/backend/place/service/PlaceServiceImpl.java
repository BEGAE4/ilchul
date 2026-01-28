package com.begae.backend.place.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.begae.backend.place.component.PromptRegistry;
import com.begae.backend.place.domain.Place;
import com.begae.backend.place.dto.*;
import com.begae.backend.place.repository.PlaceRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PlaceServiceImpl implements PlaceService {

    private final ObjectMapper objectMapper;
    @Value("${anthropic-api.api-key}")
    private String ANTHROPIC_API_KEY;

    private final String GOOGLE_FIELDMASK = "places.displayName,places.formattedAddress,places.photos.name";

    private final WebClient kakaoWebClient;
    private final WebClient googleWebClient;
    private final PlaceRepository placeRepository;
    private final PromptRegistry promptRegistry;

    public List<SearchPlaceResponseDto> searchPlace(String keyword) {

        KakaoPlaceResponseDto kakaoResponse = kakaoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/keyword.json")
                        .queryParam("query", keyword)
                        .build())
                .retrieve()
                .bodyToMono(KakaoPlaceResponseDto.class)
                .timeout(Duration.ofMinutes(5))
                .block();
        List<KakaoPlaceResponseDto.Document> documents = List.of();
        if(kakaoResponse != null) {
            documents = kakaoResponse.getDocuments() != null
                    ? kakaoResponse.getDocuments() : List.of();
        }

        return Flux.fromIterable(documents)
                .flatMap(document -> toPlaceSummary(document), 8)
                .collectList()
                .block(Duration.ofSeconds(20));
    }

    public Mono<SearchPlaceResponseDto> toPlaceSummary(KakaoPlaceResponseDto.Document document) {
        String textQuery = document.getRoadAddressName() + ", " + document.getPlaceName();

        Mono<GooglePlaceResponseDto> googleResponse = googleWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/places:searchText")
                        .build())
                .header("X-Goog-FieldMask", GOOGLE_FIELDMASK)
                .bodyValue(Map.of("textQuery", textQuery, "languageCode", "ko"))
                .retrieve()
                .bodyToMono(GooglePlaceResponseDto.class)
                .timeout(Duration.ofSeconds(10));

        Mono<PlaceSummaryDto> placeSummary = googleResponse.flatMap(response -> {
            String photoName;
            if(response != null && response.getPlaces() != null && !response.getPlaces().isEmpty()) {
                List<GooglePlaceResponseDto.Photo> photos = response.getPlaces().getFirst().getPhotos();
                if(photos != null && !photos.isEmpty()) photoName = photos.getFirst().getName();
                else photoName = null;
            } else photoName = null;

            if(photoName == null) {
                return Mono.just(buildDto(document, null));
            }

           return googleWebClient.get()
                  .uri(uriBuilder -> uriBuilder
                          .path("v1/" + photoName + "/media")
                          .queryParam("maxHeightPx", 300)
                          .queryParam("maxWidthPx", 300)
                          .queryParam("skipHttpRedirect", true)
                          .build())
                  .retrieve()
                  .bodyToMono(GooglePlaceImageResponseDto.class)

                  .timeout(Duration.ofSeconds(10))
                  .map(image -> buildDto(document, image.getPhotoUri()));

        }).onErrorResume(exception -> Mono.just(buildDto(document, null)));

        return placeSummary.flatMap(placeSummaryDto ->
                Mono.fromCallable(() -> upsertPlaceFrom(document, placeSummaryDto))
                        .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                        .map(placeId -> SearchPlaceResponseDto.builder()
                                .placeId(placeId)
                                .placeName(placeSummaryDto.getPlaceName())
                                .categoryName(placeSummaryDto.getCategoryName())
                                .placeImageUrl(placeSummaryDto.getPlaceImageUrl())
                                .build()));
    }

    private PlaceSummaryDto buildDto(KakaoPlaceResponseDto.Document document, String photoUri) {
        String[] split = document.getCategoryName().split(">");
         return PlaceSummaryDto.builder()
                .categoryName(split[0] + "· " + split[1].trim())
                .placeName(document.getPlaceName())
                .placeImageUrl(photoUri)
                .build();
    }

    public int upsertPlaceFrom(KakaoPlaceResponseDto.Document document, PlaceSummaryDto dto) {

        final String sourceId = document.getId();
        LocalDateTime now = LocalDateTime.now();

        Optional<Place> existing = placeRepository.findPlaceBySourceId(sourceId);

        if (existing.isEmpty()) {
            // 신규 데이터 바로 저장
            Place newPlace = Place.builder()
                    .sourceId(sourceId)
                    .addressName(document.getAddressName())
                    .roadAddressName(document.getRoadAddressName())
                    .categoryName(dto != null ? dto.getCategoryName() : document.getCategoryName())
                    .phone(document.getPhone())
                    .placeName(document.getPlaceName())
                    .placeUrl(document.getPlaceUrl())
                    .placeImageUrl(dto != null ? dto.getPlaceImageUrl() : null)
                    .x(Double.parseDouble(document.getX()))
                    .y(Double.parseDouble(document.getY()))
                    .lastFetchedAt(now)
                    .lastSeenAt(now)
                    .build();
            placeRepository.save(newPlace);
            return newPlace.getPlaceId();
        }

        Place place = existing.get();

        if (place.getLastSeenAt() == null || place.getLastSeenAt().isBefore(now.minusHours(6))) {
            place.markSeen();
        }

        // 이미 갱신된 데이터는 건너뛰기
        boolean stale = place.getLastFetchedAt() == null ||
                place.getLastFetchedAt().isBefore(now.minusDays(7));

        if (!stale) { // 갱신된 데이터라면 DB 쓰기 생략
            return place.getPlaceId();
        }

        place.mergeFrom(document, dto);
        placeRepository.save(place);
        return place.getPlaceId();
    }

    public RecommendKeywordDto generateKeyword(SurveyResultDto survey) throws JsonProcessingException {

        AnthropicClient client = AnthropicOkHttpClient.builder().
                apiKey(ANTHROPIC_API_KEY).
                timeout(Duration.ofMinutes(1)).
                build();

        String userTemplate = buildUserPrompt(survey);

        MessageCreateParams params = MessageCreateParams.builder()
                .model("claude-sonnet-4-5-20250929")
                .maxTokens(1000)
                .system(promptRegistry.getSystemPrompt())
                .addUserMessage(userTemplate)
                .build();

        Message message = client.messages().create(params);

        String content = message.content().getFirst().asText().text()
                .replaceAll("```json\\n", "")
                .replaceAll("```", "")
                .trim();

        RecommendKeywordDto recommend = new ObjectMapper().readValue(content, RecommendKeywordDto.class);
        return recommend;
    }

    private String buildUserPrompt(SurveyResultDto survey) throws JsonProcessingException {
        String surveyJson = objectMapper.writeValueAsString(survey);

        return promptRegistry.getUserTemplate()
                .replace("{{SURVEY_JSON}}", surveyJson);
    }
}
