package com.begae.backend.place.service;

import com.begae.backend.place.dto.GooglePlaceImageResponseDto;
import com.begae.backend.place.dto.GooglePlaceResponseDto;
import com.begae.backend.place.dto.KakaoPlaceResponseDto;
import com.begae.backend.place.dto.PlaceSummaryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceService {

    private final String GOOGLE_FIELDMASK = "places.displayName,places.formattedAddress,places.photos.name";

    private final WebClient kakaoWebClient;
    private final WebClient googleWebClient;

    public List<PlaceSummaryDto> searchPlace(String keyword) {

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

    private Mono<PlaceSummaryDto> toPlaceSummary(KakaoPlaceResponseDto.Document document) {
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

        return placeSummary;
    }

    private PlaceSummaryDto buildDto(KakaoPlaceResponseDto.Document document, String photoUri) {
        String[] split = document.getCategoryName().split(">");
         return PlaceSummaryDto.builder()
                .categoryName(split[0] + "· " + split[1].trim())
                .placeName(document.getPlaceName())
                .placeImageUrl(photoUri)
                .build();
    }
}
