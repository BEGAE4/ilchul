package com.begae.backend.plan_place.cache;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PlanDraft {

    private int userId;
    private String draftId;
    private String requestHash;
    private int totalDuration;
    private List<Integer> travelTimesByOrder; // order=1..n 순서
    private LocalDateTime createdAt;

}
