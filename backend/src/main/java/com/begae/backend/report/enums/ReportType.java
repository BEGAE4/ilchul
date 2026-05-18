package com.begae.backend.report.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReportType {
    PLAN("플랜"),
    REPLY("댓글"),
    USER("사용자");

    private final String description;
}
