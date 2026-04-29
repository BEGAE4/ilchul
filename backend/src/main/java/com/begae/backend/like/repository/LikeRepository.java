package com.begae.backend.like.repository;

import com.begae.backend.like.domain.Like;
import com.begae.backend.like.enums.LikeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Integer> {
    Optional<Like> findByUser_UserIdAndTypeIdAndLikeType(
            int userId, int typeId, LikeType likeType
    );
}
