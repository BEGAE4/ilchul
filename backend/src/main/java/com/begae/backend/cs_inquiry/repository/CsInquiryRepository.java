package com.begae.backend.cs_inquiry.repository;

import com.begae.backend.cs_inquiry.domain.CsInquiry;
import com.begae.backend.cs_inquiry.enums.InquiryType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CsInquiryRepository extends JpaRepository<CsInquiry, Integer> {

    @Query("SELECT ci FROM CsInquiry ci " +
           "JOIN FETCH ci.user " +
           "WHERE ci.isDeleted = false " +
           "AND (:lastInquiryId IS NULL OR ci.inquiryId < :lastInquiryId) " +
           "AND (:category IS NULL OR ci.inquiryType = :category) " +
           "AND (:search IS NULL OR ci.content LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY ci.inquiryId DESC")
    List<CsInquiry> findByCursor(
            @Param("lastInquiryId") Integer lastInquiryId,
            @Param("category") InquiryType category,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT ci FROM CsInquiry ci " +
           "JOIN FETCH ci.user " +
           "WHERE ci.isDeleted = false " +
           "AND ci.user.userId = :userId " +
           "AND (:lastInquiryId IS NULL OR ci.inquiryId < :lastInquiryId) " +
           "ORDER BY ci.inquiryId DESC")
    List<CsInquiry> findByUserCursor(
            @Param("userId") Integer userId,
            @Param("lastInquiryId") Integer lastInquiryId,
            Pageable pageable
    );
}




