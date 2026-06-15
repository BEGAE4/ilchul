package com.begae.backend.report.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.reply.domain.Reply;
import com.begae.backend.reply.exception.ReplyErrorCode;
import com.begae.backend.reply.repository.ReplyRepository;
import com.begae.backend.report.domain.AdminLog;
import com.begae.backend.report.domain.Report;
import com.begae.backend.report.dto.*;
import com.begae.backend.report.enums.AdminAction;
import com.begae.backend.report.enums.ReportStatus;
import com.begae.backend.report.exception.ReportErrorCode;
import com.begae.backend.report.repository.AdminLogRepository;
import com.begae.backend.report.repository.ReportRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

import static com.begae.backend.report.dto.AdminReportResponseDto.AdminReportItem;

@Service
@RequiredArgsConstructor
public class ReportAdminServiceImpl implements ReportAdminService {

    private final PlanRepository planRepository;
    private final ReplyRepository replyRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final AdminLogRepository adminLogRepository;

    @Transactional(readOnly = true)
    @Override
    public AdminReportResponseDto findReportAdmin(Integer userId, AdminReportRequestDto adminReportRequestDto) {
        PageRequest pageRequest = PageRequest.of(
                adminReportRequestDto.getPage() - 1, adminReportRequestDto.getSize(),
                adminReportRequestDto.getSort().getSort()
        );

        Page<Report> reportPage = reportRepository.searchReports(adminReportRequestDto, pageRequest);
        Page<AdminReportItem> itemPage = reportPage.map(this::toItem);

        return AdminReportResponseDto.of(itemPage);
    }

    @Transactional(readOnly = true)
    @Override
    public AdminReportDetailResponseDto findReportDetail(Integer reportId) {

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException(ReportErrorCode.REPORT_NOT_FOUND));

        ReportTargetDto reportTargetDto = buildTarget(report);
        int reportCount = (int) reportRepository
                .countDistinctReportersByTypeAndTargetId(
                        report.getReportType(), report.getTypeId());
        Boolean autoBlinded = resolveAutoBlinded(report);

        List<AdminReportDetailResponseDto.History> histories = report.getAdminLogs().stream()
                .sorted(Comparator.comparing(AdminLog::getProcessedAt))
                .map(AdminReportDetailResponseDto.History::of)
                .toList();

        List<AdminReportDetailResponseDto.RelatedReport> relatedReports = reportRepository
                .findRelatedReports(report.getReportType(), report.getTypeId(), report.getReportId())
                .stream()
                .map(AdminReportDetailResponseDto.RelatedReport::of)
                .toList();

        return AdminReportDetailResponseDto.of(
                report, reportTargetDto, autoBlinded, reportCount, histories, relatedReports);
    }

    @Transactional
    @Override
    public AdminReportDetailResponseDto changeReportStatus(Integer adminId, Integer reportId, AdminReportStatusChangeRequestDto adminReportStatusChangeRequestDto) {

        if (adminReportStatusChangeRequestDto.getStatus().equals(ReportStatus.RESOLVED) ||
                adminReportStatusChangeRequestDto.getStatus().equals(ReportStatus.PENDING)) {
            throw new CustomException(ReportErrorCode.REPORT_INVALID_REQUEST_DATA);
        }

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException(ReportErrorCode.REPORT_NOT_FOUND));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        report.updateReportStatus(adminReportStatusChangeRequestDto.getStatus());
        AdminLog adminLog = AdminLog.of(admin, AdminAction.NO_ACTION, report, adminReportStatusChangeRequestDto.getNote());
        adminLogRepository.save(adminLog);

        return findReportDetail(reportId);
    }

    private AdminReportItem toItem(Report report) {
        ReportTargetDto target = buildTarget(report);
        int reportCount = (int) reportRepository
                .countDistinctReportersByTypeAndTargetId(
                        report.getReportType(), report.getTypeId());
        boolean autoBlinded = resolveAutoBlinded(report);

        return AdminReportItem.of(report, target, reportCount, autoBlinded, null);
    }

    private String truncate(String content, int max) {
        if (content == null) return null;
        return content.length() <= max ? content : content.substring(0, max) + "...";
    }

    private boolean resolveAutoBlinded(Report report) {
        return switch (report.getReportType()) {
            case PLAN -> planRepository.findById(report.getTypeId())
                    .map(Plan::getIsBlinded).orElse(false);
            case REPLY -> replyRepository.findById(report.getTypeId())
                    .map(Reply::getIsBlinded).orElse(false);
            case USER -> false;
        };
    }

    private ReportTargetDto buildTarget(Report report) {
        return switch (report.getReportType()) {
            case PLAN -> {
                Plan plan = planRepository.findById(report.getTypeId())
                        .orElseThrow(() -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND));
                yield ReportTargetDto.of(
                        report.getReportType(), plan.getPlanId(),
                        plan.getUser().getUserNickname(), plan.getPlanTitle(),
                        "/plan/" + plan.getPlanId()
                );
            }
            case REPLY -> {
                Reply reply = replyRepository.findById(report.getTypeId())
                        .orElseThrow(() -> new CustomException(ReplyErrorCode.REPLY_NOT_FOUND));
                yield ReportTargetDto.of(
                        report.getReportType(), reply.getReplyId(),
                        reply.getUser().getUserNickname(), reply.getContent(),
                        "/reply/" + reply.getReplyId()
                );
            }
            case USER -> {
                User user = userRepository.findById(report.getTypeId())
                        .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
                yield ReportTargetDto.of(
                        report.getReportType(), user.getUserId(),
                        user.getUserNickname(), user.getUserNickname(),
                        "/profile/" + user.getUserId()
                );
            }
        };
    }


}
