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

        List<PlaceSummaryDto> places = new ArrayList<>();

        List<KakaoPlaceResponseDto.Document> documents = kakaoResponse.getDocuments() != null
                ? kakaoResponse.getDocuments() : List.of();

        for(KakaoPlaceResponseDto.Document document : documents) {
            String textQuery = document.getRoadAddressName() + ", " + document.getPlaceName();
            GooglePlaceResponseDto googleResponse = googleWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/places:searchText")
                            .build())
                    .header("X-Goog-FieldMask", GOOGLE_FIELDMASK)
                    .bodyValue(Map.of("textQuery", textQuery, "languageCode", "ko"))
                    .retrieve()
                    .bodyToMono(GooglePlaceResponseDto.class)
                    .timeout(Duration.ofMinutes(5))
                    .block();


            String photoName;
            if(googleResponse != null && googleResponse.getPlaces() != null && !googleResponse.getPlaces().isEmpty()) {
                List<GooglePlaceResponseDto.Photo> photos = googleResponse.getPlaces().getFirst().getPhotos();
                if(photos != null && !photos.isEmpty()) photoName = photos.getFirst().getName();
                else photoName = "";
            } else photoName = "";

            GooglePlaceImageResponseDto imageResponse = googleWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("v1/" + photoName + "/media")
                            .queryParam("maxHeightPx", 300)
                            .queryParam("maxWidthPx", 300)
                            .queryParam("skipHttpRedirect", true)
                            .build())
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response
                            -> response.bodyToMono(String.class).then(Mono.empty()))
                    .bodyToMono(GooglePlaceImageResponseDto.class)
                    .onErrorResume(exception -> Mono.empty())
                    .timeout(Duration.ofMinutes(5))
                    .block();

            String photoUri = imageResponse == null ? "" : imageResponse.getPhotoUri();

            String[] split = document.getCategoryName().split(">");
            places.add(PlaceSummaryDto.builder()
                    .categoryName(split[0] + "· " + split[1].trim())
                    .placeName(document.getPlaceName())
                    .placeImage(photoUri)
                    .build());
        }



        return places;
    }
}
