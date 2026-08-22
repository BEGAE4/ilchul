package com.begae.backend.place.util;

import com.begae.backend.place.dto.SearchAutocompleteItemDto;

import java.util.List;

public interface CategoryPlaceAutocompleteProvider {

    List<SearchAutocompleteItemDto> findCategoryCandidates(String prefix, int limit);

    List<SearchAutocompleteItemDto> findPlaceCandidates(String prefix, int limit);
}
