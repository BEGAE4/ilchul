package com.begae.backend.like.repository;

import com.begae.backend.like.domain.Like;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Integer> {
    Optional<Like> findByUserAndPlan(User user, Plan plan);
}
