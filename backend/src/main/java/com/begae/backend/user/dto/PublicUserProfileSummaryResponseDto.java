package com.begae.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicUserProfileSummaryResponseDto {
    private Integer publicPlanCount;
    private Integer verifyPlanCount;
    private Integer scrappedByOthersCount;

    public static PublicUserProfileSummaryResponseDto of(
            Integer publicPlanCount,
            Integer verifyPlanCount,
            Integer scrappedByOthersCount
    ) {
        return new PublicUserProfileSummaryResponseDto(
                publicPlanCount, verifyPlanCount, scrappedByOthersCount
        );
    }
}
