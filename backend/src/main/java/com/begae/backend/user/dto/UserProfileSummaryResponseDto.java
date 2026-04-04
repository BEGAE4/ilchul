package com.begae.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileSummaryResponseDto {
    private Integer publicPlanCount;
    private Integer verifyPlanCount;
    private Integer scrappedByOthersCount;
    private Integer savedCourseCount;
}
