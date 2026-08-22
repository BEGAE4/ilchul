package com.begae.backend.place.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class SearchLogSaveRequest {
    private String name;

    public static SearchLogSaveRequest of(String name) {
        return new SearchLogSaveRequest(name);
    }

}
