package com.begae.backend.report.repository;

import com.begae.backend.report.domain.Report;
import com.begae.backend.report.enums.ReportType;
import com.begae.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Integer>, ReportRepositoryCustom {

    boolean existsByReportUserAndReportTypeAndTypeId(User reporter, ReportType targetType, Integer targetId);

    @Query("""
            SELECT COUNT(DISTINCT r.reportUser.userId)
            FROM Report r
            WHERE r.reportType = :reportType AND r.typeId = :targetId
            """
    )
    long countDistinctReportersByTypeAndTargetId(
            @Param("reportType") ReportType reportType,
            @Param("targetId") Integer targetId);

    @Query("""
        SELECT r FROM Report r
        WHERE r.reportType = :type
          AND r.typeId = :targetId
          AND r.reportId != :excludeReportId
        ORDER BY r.createAt DESC
   """)
    List<Report> findRelatedReports(
            @Param("type") ReportType type,
            @Param("targetId") Integer targetId,
            @Param("excludeReportId") Integer excludeReportId);
}
