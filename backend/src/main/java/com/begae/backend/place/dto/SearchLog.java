package com.begae.backend.place.dto;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@EqualsAndHashCode
public class SearchLog {
    private String name;
    private String createdAt;
}
