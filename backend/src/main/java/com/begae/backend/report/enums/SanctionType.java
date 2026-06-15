package com.begae.backend.report.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SanctionType {
    BLINDED      ("블라인드"),
    WARNED       ("경고"),
    BANNED       ("정지");

    private final String description;
}