package com.begae.backend.report.repository;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.reply.domain.Reply;
import com.begae.backend.report.domain.Report;
import com.begae.backend.report.dto.AdminReportRequestDto;
import com.begae.backend.report.enums.ReportType;
import com.begae.backend.user.domain.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class ReportRepositoryCustomImpl implements ReportRepositoryCustom {

    private final EntityManager em;

    @Override
    public Page<Report> searchReports(AdminReportRequestDto adminReportRequestDto, Pageable pageable) {
        CriteriaBuilder cb = em.getCriteriaBuilder();

        CriteriaQuery<Report> cq = cb.createQuery(Report.class);
        Root<Report> reportRoot = cq.from(Report.class);

        List<Predicate> predicates = buildPredicates(cb, reportRoot, adminReportRequestDto);
        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(buildOrders(cb, reportRoot, pageable.getSort()));

        TypedQuery<Report> reportTypedQuery = em.createQuery(cq);
        reportTypedQuery.setFirstResult((int) pageable.getOffset());
        reportTypedQuery.setMaxResults(pageable.getPageSize());

        List<Report> content = reportTypedQuery.getResultList();

        long total = countTotal(adminReportRequestDto);

        return new PageImpl<>(content, pageable, total);
    }

    /**
     * 조건 생성
     *
     * @param cb
     * @param root
     * @param adminReportRequestDto
     * @return
     */
    private List<Predicate> buildPredicates(
            CriteriaBuilder cb, Root<Report> root, AdminReportRequestDto adminReportRequestDto) {

        List<Predicate> predicates = new ArrayList<>();

        if (adminReportRequestDto.getStatus() != null) {
            predicates.add(cb.equal(root.get("reportStatus"), adminReportRequestDto.getStatus()));
        }

        if (adminReportRequestDto.getReasonCode() != null) {
            predicates.add(cb.equal(root.get("reportReason"), adminReportRequestDto.getReasonCode()));
        }

        if (adminReportRequestDto.getTargetType() != null) {
            predicates.add(cb.equal(root.get("reportType"), adminReportRequestDto.getTargetType()));
        }

        if (adminReportRequestDto.getQ() != null) {
            String keyword = "%" + adminReportRequestDto.getQ() + "%";
            Join<Report, User> reporter = root.join("reportUser", JoinType.LEFT);
            Join<Report, User> reported = root.join("reportedUser", JoinType.LEFT);

            predicates.add(cb.or(
                    cb.like(reporter.get("userNickname"), keyword),
                    cb.like(reported.get("userNickname"), keyword)
            ));
        }

        if (Boolean.TRUE.equals(adminReportRequestDto.getAutoBlindedOnly())) {
            predicates.add(buildAutoBlindedPredicate(cb, root));
        }

        return predicates;
    }

    /**
     * autoBlindedOnly 처리
     * - PLAN 신고: plan.is_blinded = true 인 것
     * - REPLY 신고: reply.is_blinded = true 인 것
     * - USER 신고: 자동 블라인드 대상 아님 → 제외
     *
     * @param cb
     * @param root
     * @return
     */
    private Predicate buildAutoBlindedPredicate(CriteriaBuilder cb, Root<Report> root) {

        Subquery<Integer> blindPlanIds = cb.createQuery().subquery(Integer.class);
        Root<Plan> planRoot = blindPlanIds.from(Plan.class);
        blindPlanIds.select(planRoot.get("planId"))
                .where(cb.isTrue(planRoot.get("isBlinded")));

        Subquery<Integer> blindReplyIds = cb.createQuery().subquery(Integer.class);
        Root<Reply> replyRoot = blindReplyIds.from(Reply.class);
        blindReplyIds.select(replyRoot.get("replyId"))
                .where(cb.isTrue(replyRoot.get("isBlinded")));

        return cb.or(
                cb.and(
                        cb.equal(root.get("reportType"), ReportType.PLAN),
                        root.get("typeId").in(blindPlanIds)
                ),
                cb.and(
                        cb.equal(root.get("reportType"), ReportType.REPLY),
                        root.get("typeId").in(blindReplyIds)
                )
        );
    }

    /**
     * 정렬 조건
     *
     * @param cb
     * @param root
     * @param sort
     * @return
     */
    private List<Order> buildOrders(CriteriaBuilder cb, Root<Report> root, Sort sort) {
        List<Order> orders = new ArrayList<>();
        sort.forEach(s -> {
            Path<Object> path = root.get(s.getProperty());
            orders.add(s.isAscending() ? cb.asc(path) : cb.desc(path));
        });

        if (orders.isEmpty()) {
            orders.add(cb.desc(root.get("createAt")));
        }
        return orders;
    }

    /**
     * 페이징용 count 쿼리
     *
     * @param adminReportRequestDto
     * @return
     */
    private long countTotal(AdminReportRequestDto adminReportRequestDto) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        Root<Report> root = cq.from(Report.class);

        cq.select(cb.count(root));
        cq.where(buildPredicates(cb, root, adminReportRequestDto).toArray(new Predicate[0]));

        return em.createQuery(cq).getSingleResult();
    }
}
