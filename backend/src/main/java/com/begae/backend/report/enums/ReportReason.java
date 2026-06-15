package com.begae.backend.report.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Set;

@Getter
@RequiredArgsConstructor
public enum ReportReason {
    SPAM_AD           ("스팸/광고", Set.of(ReportType.PLAN, ReportType.REPLY)),
    FAKE_INFO         ("허위정보", Set.of(ReportType.PLAN)),
    OBSCENE           ("음란성", Set.of(ReportType.PLAN, ReportType.REPLY)),
    ABUSE             ("욕설/비방", Set.of(ReportType.PLAN, ReportType.REPLY)),
    COPYRIGHT         ("저작권 침해", Set.of(ReportType.PLAN, ReportType.USER)),
    IMPROPER_PROFILE  ("부적절한 닉네임/프로필", Set.of(ReportType.USER)),
    IMPERSONATION     ("타인 사칭", Set.of(ReportType.USER)),
    PERSONAL_INFO_LEAK("개인정보 노출", Set.of(ReportType.PLAN, ReportType.REPLY, ReportType.USER)),
    ETC               ("기타(직접 입력)", Set.of(ReportType.PLAN, ReportType.REPLY, ReportType.USER));

    private final String description;
    private final Set<ReportType> applicableTypes;

    public boolean supports(ReportType targetType) {
        return applicableTypes.contains(targetType);
    }
}
