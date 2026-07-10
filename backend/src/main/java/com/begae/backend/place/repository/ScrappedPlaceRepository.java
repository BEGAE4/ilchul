package com.begae.backend.place.repository;

import com.begae.backend.place.domain.ScrappedPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScrappedPlaceRepository extends JpaRepository<ScrappedPlace, Integer> {
    Optional<ScrappedPlace> findByUser_UserIdAndPlace_PlaceId(Integer userId, Integer placeId);
}
