package com.begae.backend.report.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.reply.domain.Reply;
import com.begae.backend.reply.exception.ReplyErrorCode;
import com.begae.backend.reply.repository.ReplyRepository;
import com.begae.backend.report.domain.Report;
import com.begae.backend.report.dto.CreateReportRequestDto;
import com.begae.backend.report.dto.CreateReportResponseDto;
import com.begae.backend.report.dto.ReportReasonResponseDto;
import com.begae.backend.report.enums.ReportReason;
import com.begae.backend.report.enums.ReportType;
import com.begae.backend.report.exception.ReportErrorCode;
import com.begae.backend.report.repository.ReportRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private static final int BLIND_THRESHOLD = 3;

    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final ReplyRepository replyRepository;
    private final ReportRepository reportRepository;

    @Override
    @Transactional
    public CreateReportResponseDto createReport(Integer reporterUserId, CreateReportRequestDto createReportRequestDto) {
        validReportReason(createReportRequestDto);

        ReportType reportType = createReportRequestDto.getTargetType();
        Integer typeId = createReportRequestDto.getTargetId();

        // 신고 타입별로 reason이 맞는지 확인
        if (!createReportRequestDto.getReasonCode().supports(reportType)) {
            throw new CustomException(ReportErrorCode.REPORT_NOT_REASON);
        }

        User reporter = userRepository.findById(reporterUserId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
        User reportedUser = findReportedUser(reportType, typeId);

        validNotSelfReport(reporter, reportedUser);
        validDuplicateReport(reporter, createReportRequestDto);

        Report report = Report.of(reporter, reportedUser, createReportRequestDto);
        reportRepository.save(report);

        return CreateReportResponseDto.of(
                report,
                checkAndApplyAutoBlind(reportType, typeId));
    }

    @Override
    @Transactional(readOnly = true)
    public ReportReasonResponseDto findReportReason(ReportType type) {
        List<ReportReasonResponseDto.ReasonItem> reportReasons = Arrays.stream(ReportReason.values())
                .filter(reportReason -> reportReason.supports(type))
                .map(reportReason -> ReportReasonResponseDto.ReasonItem.of(
                        reportReason.name(),
                        reportReason.getDescription(),
                        reportReason == ReportReason.ETC
                )).toList();

        return ReportReasonResponseDto.of(type, reportReasons);
    }

    /**
     * ETC일 때 detail이 없으면 400오류 반환
     *
     * @param createReportRequestDto
     */
    private void validReportReason(CreateReportRequestDto createReportRequestDto) {
        if (createReportRequestDto.getReasonCode() == ReportReason.ETC
                && !StringUtils.hasText(createReportRequestDto.getDetail())) {
            throw new CustomException(ReportErrorCode.REPORT_INVALID_REQUEST_DATA);
        }
    }

    /**
     * user본인이 본인을 신고 불가
     *
     * @param reporter
     * @param reportedUser
     */
    private void validNotSelfReport(User reporter, User reportedUser) {
        if (reporter.getUserId().equals(reportedUser.getUserId())) {
            throw new CustomException(ReportErrorCode.SELF_REPORT_FORBIDDEN);
        }
    }

    /**
     * 동일한 대상에 대해 신고하는 경우 오류 반환(200)
     *
     * @param reporter
     * @param createReportRequestDto
     */
    private void validDuplicateReport(User reporter, CreateReportRequestDto createReportRequestDto) {
        boolean exist = reportRepository.existsByReportUserAndReportTypeAndTypeId(
                reporter,
                createReportRequestDto.getTargetType(),
                createReportRequestDto.getTargetId()
        );

        if (exist) {
            throw new CustomException(ReportErrorCode.DUPLICATE_REPORT);
        }
    }

    /**
     * 신고된 유저 조회
     * @param reportType
     * @param targetId
     * @return
     */
    private User findReportedUser(ReportType reportType, Integer targetId) {
        return switch (reportType) {
            case USER -> userRepository.findById(targetId)
                    .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
            case PLAN -> {
                Plan plan = planRepository.findById(targetId)
                        .orElseThrow(() -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND));
                yield plan.getUser();
            }
            case REPLY -> {
                Reply reply = replyRepository.findById(targetId)
                        .orElseThrow(() -> new CustomException(ReplyErrorCode.REPLY_NOT_FOUND));
                yield reply.getUser();
            }
        };
    }

    /**
     * autoBlind 여부 조회 및 autoBlind 처리
     * @param reportType
     * @param targetId
     * @return
     */
    private boolean checkAndApplyAutoBlind(ReportType reportType, Integer targetId) {
        if (reportType == ReportType.USER) return false;

        long totalReporterCount = reportRepository.countDistinctReportersByTypeAndTargetId(reportType, targetId);
        if (totalReporterCount < BLIND_THRESHOLD) return false;

        return switch (reportType) {
            case PLAN -> {
                Plan plan = planRepository.findById(targetId)
                        .orElseThrow(() -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND));
                if(plan.getIsBlinded()) yield false;
                plan.updateBlind();
                yield true;
            }
            case REPLY -> {
                Reply reply = replyRepository.findById(targetId)
                        .orElseThrow(() -> new CustomException(ReplyErrorCode.REPLY_NOT_FOUND));
                if(reply.getIsBlinded()) yield false;
                reply.updateBlind();
                yield true;
            }
            default -> false;
        };
    }


}
