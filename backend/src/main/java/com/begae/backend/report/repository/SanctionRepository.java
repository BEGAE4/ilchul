package com.begae.backend.report.repository;

import com.begae.backend.report.domain.Sanction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SanctionRepository extends JpaRepository<Sanction, Integer> {
}
