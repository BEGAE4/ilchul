package com.begae.backend.report.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AdminAction {
    BLINDED    ("블라인드 처리"),
    WARNED     ("경고 처리"),
    BANNED     ("정지 처리"),
    NO_ACTION  ("처리 안함");

    private final String description;
}
