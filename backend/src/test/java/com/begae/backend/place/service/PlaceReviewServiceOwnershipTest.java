package com.begae.backend.place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.place.domain.PlaceReview;
import com.begae.backend.place.dto.PlaceReviewRequestDto;
import com.begae.backend.place.exception.PlaceErrorCode;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.place.repository.PlaceReviewRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PlaceReviewServiceOwnershipTest {

    private final PlaceReviewRepository reviewRepository = mock(PlaceReviewRepository.class);
    private final PlaceReviewServiceImpl service = new PlaceReviewServiceImpl(
            reviewRepository,
            mock(PlaceRepository.class),
            mock(UserRepository.class)
    );

    @Test
    void 작성자는_후기_내용을_수정할_수_있다() {
        PlaceReview review = ownedReview(5);
        when(reviewRepository.findByReviewIdAndPlace_PlaceId(9, 3)).thenReturn(Optional.of(review));

        var response = service.updateReview(3, 9, 5, new PlaceReviewRequestDto("수정 후"));

        assertThat(response.getContent()).isEqualTo("수정 후");
    }

    @Test
    void 작성자는_후기를_삭제할_수_있다() {
        PlaceReview review = ownedReview(5);
        when(reviewRepository.findByReviewIdAndPlace_PlaceId(9, 3)).thenReturn(Optional.of(review));

        service.deleteReview(3, 9, 5);

        verify(reviewRepository).delete(review);
    }

    @Test
    void 다른_사용자의_후기_수정은_403으로_거절한다() {
        PlaceReview otherUserReview = ownedReview(7);
        when(reviewRepository.findByReviewIdAndPlace_PlaceId(9, 3))
                .thenReturn(Optional.of(otherUserReview));

        assertThatThrownBy(() -> service.updateReview(3, 9, 5, new PlaceReviewRequestDto("수정")))
                .isInstanceOfSatisfying(CustomException.class, error ->
                        assertThat(error.getErrorCode()).isEqualTo(GlobalErrorCode.HANDLE_ACCESS_DENIED));
    }

    @Test
    void 없는_후기는_404로_응답한다() {
        when(reviewRepository.findByReviewIdAndPlace_PlaceId(9, 3)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteReview(3, 9, 5))
                .isInstanceOfSatisfying(CustomException.class, error ->
                        assertThat(error.getErrorCode()).isEqualTo(PlaceErrorCode.REVIEW_NOT_FOUND));
    }

    private PlaceReview ownedReview(int userId) {
        User user = mock(User.class);
        when(user.getUserId()).thenReturn(userId);
        return PlaceReview.builder().user(user).content("수정 전").build();
    }
}
