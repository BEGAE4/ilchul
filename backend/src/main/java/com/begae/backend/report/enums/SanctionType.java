package com.begae.backend.report.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SanctionType {
    CONTENT_BLINDED      ("블라인드"),
    WARNING              ("경고"),
    PERMANENT_BAN        ("정지"),
    TEMP_BAN             ("임시 정지");

    private final String description;
}