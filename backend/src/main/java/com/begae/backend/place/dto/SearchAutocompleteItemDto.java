package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SearchAutocompleteItemDto {

    private final String keyword;
    private final AutocompleteType type;
    private final Double score;
    private final Integer placeId;
}
