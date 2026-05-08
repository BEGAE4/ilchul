package com.begae.backend.cs_inquiry.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InquiryType {
    GENERAL("일반"),
    BUG("버그"),
    SUGGESTION("제안"),
    OTHER("기타");

    private final String description;
}
