package com.begae.backend.place.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class SearchLogSaveRequest {
    private String name;
}
