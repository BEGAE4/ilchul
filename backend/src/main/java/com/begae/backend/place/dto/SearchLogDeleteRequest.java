package com.begae.backend.place.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class SearchLogDeleteRequest {
    private String name;
    private String createdAt;
}
