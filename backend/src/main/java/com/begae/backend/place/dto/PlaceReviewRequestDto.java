package com.begae.backend.place.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlaceReviewRequestDto {
    @NotBlank(message = "후기 내용은 필수입니다.")
    @Size(max = 1000, message = "후기는 최대 1000자까지 작성 가능합니다.")
    private String content;
}
