package com.begae.backend.place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.domain.Place;
import com.begae.backend.place.domain.ScrappedPlace;
import com.begae.backend.place.dto.ScrappedPlaceCreateResponseDto;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.place.repository.ScrappedPlaceRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScrappedPlaceServiceImpl implements ScrappedPlaceService {

    private final ScrappedPlaceRepository scrappedPlaceRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ScrappedPlaceCreateResponseDto scrapPlace(Integer userId, Integer placeId) {
        Place place = placeRepository.findByIdWithLock(placeId)
                .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Optional<ScrappedPlace> existing = scrappedPlaceRepository.findByUser_UserIdAndPlace_PlaceId(userId, placeId);

        boolean isBookmarked;
        if (existing.isPresent()) {
            ScrappedPlace scrappedPlace = existing.get();
            if (!scrappedPlace.isScrapped()) {
                scrappedPlace.toggle();
                place.increaseScrappedCount();
            }
            isBookmarked = true;
        } else {
            scrappedPlaceRepository.save(ScrappedPlace.of(user, place));
            place.increaseScrappedCount();
            isBookmarked = true;
        }

        return ScrappedPlaceCreateResponseDto.from(place, isBookmarked);
    }

    @Override
    @Transactional
    public ScrappedPlaceCreateResponseDto unscrapPlace(Integer userId, Integer placeId) {
        Place place = placeRepository.findByIdWithLock(placeId)
                .orElseThrow(() -> new CustomException(PlaceErrorCode.PLACE_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Optional<ScrappedPlace> existing = scrappedPlaceRepository.findByUser_UserIdAndPlace_PlaceId(userId, placeId);

        boolean isBookmarked;
        if (existing.isPresent()) {
            ScrappedPlace scrappedPlace = existing.get();
            if (scrappedPlace.isScrapped()) {
                scrappedPlace.toggle();
                place.decreaseScrappedCount();
            }
            isBookmarked = false;
        } else {
            isBookmarked = false;
        }

        return ScrappedPlaceCreateResponseDto.from(place, isBookmarked);
    }
}
