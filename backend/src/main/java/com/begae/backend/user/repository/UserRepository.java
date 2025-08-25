package com.begae.backend.user.repository;

import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUserEmailAndSocialType(String userEmail, SocialType socialType);
}
