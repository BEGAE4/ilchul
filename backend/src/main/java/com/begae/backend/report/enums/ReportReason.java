package com.begae.backend.report.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReportReason {
    SPAM("스팸/영리홍보"),
    INAPPROPRIATE("부적절한 콘텐츠"),
    ABUSE("욕설/비하"),
    OTHER("기타");

    private final String description;
}
