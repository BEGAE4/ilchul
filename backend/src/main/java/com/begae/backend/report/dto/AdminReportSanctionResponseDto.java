package com.begae.backend.report.dto;

import com.begae.backend.report.domain.Sanction;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AdminReportSanctionResponseDto {

    private Integer sanctionId;
    private AdminReportDetailResponseDto adminReportDetailResponseDto;

    public static AdminReportSanctionResponseDto of(
            Sanction sanction, AdminReportDetailResponseDto adminReportDetailResponseDto) {
        return new AdminReportSanctionResponseDto(sanction.getSanctionId(), adminReportDetailResponseDto);
    }
}
