package com.begae.backend.report.repository;


import com.begae.backend.report.domain.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminLogRepository extends JpaRepository<AdminLog, Integer> {
}
