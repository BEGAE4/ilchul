package com.begae.backend.report.dto;

import com.begae.backend.report.enums.ReportType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter

@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ReportTargetDto {
    private ReportType type;
    private Integer id;
    private String ownerId;
    private String title;
    private String contextUrl;

    public static ReportTargetDto of(ReportType type, Integer id,
                                     String ownerId, String title, String contextUrl) {
        return ReportTargetDto.builder()
                .type(type).id(id)
                .ownerId(ownerId)
                .title(title)
                .contextUrl(contextUrl)
                .build();
    }
}