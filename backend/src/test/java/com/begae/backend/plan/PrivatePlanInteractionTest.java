package com.begae.backend.plan;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.like.domain.Like;
import com.begae.backend.like.enums.LikeType;
import com.begae.backend.like.repository.LikeRepository;
import com.begae.backend.like.service.LikeServiceImpl;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.ScrappedPlan;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.plan.service.ScrappedPlanServiceImpl;
import com.begae.backend.reply.domain.Reply;
import com.begae.backend.reply.dto.request.CreateReplyRequestDto;
import com.begae.backend.reply.repository.LikeReplyRepository;
import com.begae.backend.reply.repository.ReplyRepository;
import com.begae.backend.reply.service.ReplyService;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 작성자가 아닌 사용자는 비공개·블라인드 플랜에 새로 반응하거나 댓글을 볼 수 없다.
 * 이미 해둔 좋아요·스크랩 취소는 허용한다.
 */
class PrivatePlanInteractionTest {

    private static final int OWNER_ID = 1;
    private static final int VIEWER_ID = 2;
    private static final int PLAN_ID = 10;

    private final PlanRepository planRepository = mock(PlanRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final User owner = user(OWNER_ID);
    private final User viewer = user(VIEWER_ID);
    private Plan privatePlan;

    @BeforeEach
    void setUp() {
        privatePlan = Plan.builder()
                .planId(PLAN_ID).user(owner).isPlanVisible(false).likeCount(1).scrapCount(1)
                .build();
        when(planRepository.findById(PLAN_ID)).thenReturn(Optional.of(privatePlan));
        when(planRepository.findByIdWithLock(PLAN_ID)).thenReturn(Optional.of(privatePlan));
        when(userRepository.findById(VIEWER_ID)).thenReturn(Optional.of(viewer));
    }

    @Nested
    class 좋아요 {

        private final LikeRepository likeRepository = mock(LikeRepository.class);
        private final LikeServiceImpl service =
                new LikeServiceImpl(likeRepository, userRepository, planRepository, mock(PlaceRepository.class));

        @Test
        void 비공개_플랜에는_좋아요할_수_없다() {
            assertPrivate(() -> service.likePlan(PLAN_ID, VIEWER_ID));

            verify(likeRepository, never()).save(any());
            assertThat(privatePlan.getLikeCount()).isEqualTo(1);
        }

        @Test
        void 비공개로_바뀐_플랜의_좋아요는_취소할_수_있다() {
            when(likeRepository.findByUser_UserIdAndTypeIdAndLikeType(VIEWER_ID, PLAN_ID, LikeType.PLAN))
                    .thenReturn(Optional.of(Like.createPlanLike(viewer, privatePlan)));

            assertThat(service.unlikePlan(PLAN_ID, VIEWER_ID).getIsLiked()).isFalse();
            assertThat(privatePlan.getLikeCount()).isZero();
        }
    }

    @Nested
    class 스크랩 {

        private final ScrappedPlanRepository scrappedPlanRepository = mock(ScrappedPlanRepository.class);
        private final ScrappedPlanServiceImpl service =
                new ScrappedPlanServiceImpl(scrappedPlanRepository, planRepository, userRepository);

        @Test
        void 비공개_플랜은_새로_스크랩할_수_없다() {
            assertPrivate(() -> service.createPlanScrapped(VIEWER_ID, PLAN_ID));

            verify(scrappedPlanRepository, never()).save(any());
        }

        @Test
        void 스크랩을_취소했던_비공개_플랜은_다시_스크랩할_수_없다() {
            ScrappedPlan cancelled = ScrappedPlan.of(viewer, privatePlan);
            cancelled.toggle();
            when(scrappedPlanRepository.findByUser_UserIdAndPlan_PlanId(VIEWER_ID, PLAN_ID)).thenReturn(Optional.of(cancelled));

            assertPrivate(() -> service.createPlanScrapped(VIEWER_ID, PLAN_ID));

            assertThat(cancelled.isScrapped()).isFalse();
        }

        @Test
        void 비공개로_바뀐_플랜의_스크랩은_취소할_수_있다() {
            ScrappedPlan scrapped = ScrappedPlan.of(viewer, privatePlan);
            when(scrappedPlanRepository.findByUser_UserIdAndPlan_PlanId(VIEWER_ID, PLAN_ID)).thenReturn(Optional.of(scrapped));

            service.createPlanScrapped(VIEWER_ID, PLAN_ID);

            assertThat(scrapped.isScrapped()).isFalse();
        }
    }

    @Nested
    class 댓글 {

        private final ReplyRepository replyRepository = mock(ReplyRepository.class);
        private final LikeReplyRepository likeReplyRepository = mock(LikeReplyRepository.class);
        private final ReplyService service =
                new ReplyService(replyRepository, likeReplyRepository, planRepository, userRepository);

        @Test
        void 비공개_플랜에는_댓글을_달_수_없다() {
            assertPrivate(() -> service.createReply(VIEWER_ID, PLAN_ID, new CreateReplyRequestDto("좋아요", null, null)));

            verify(replyRepository, never()).save(any());
        }

        @Test
        void 비공개_플랜의_댓글_목록을_볼_수_없다() {
            assertPrivate(() -> service.getRepliesOfPlan(VIEWER_ID, PLAN_ID, 10, null));
        }

        @Test
        void 비공개_플랜의_대댓글_목록을_볼_수_없다() {
            Reply parent = replyOnPrivatePlan(5);

            assertPrivate(() -> service.getChildReplies(VIEWER_ID, parent.getReplyId(), 10, null));
        }

        @Test
        void 비공개_플랜의_댓글에는_좋아요할_수_없다() {
            Reply reply = replyOnPrivatePlan(6);

            assertPrivate(() -> service.likeReply(VIEWER_ID, reply.getReplyId()));

            verify(likeReplyRepository, never()).save(any());
        }

        private Reply replyOnPrivatePlan(int replyId) {
            Reply reply = Reply.of(owner, privatePlan, "작성자 댓글", null);
            ReflectionTestUtils.setField(reply, "replyId", replyId);
            when(replyRepository.findById(replyId)).thenReturn(Optional.of(reply));
            return reply;
        }
    }

    private static void assertPrivate(org.assertj.core.api.ThrowableAssert.ThrowingCallable call) {
        assertThatThrownBy(call)
                .isInstanceOf(CustomException.class)
                .extracting("errorCode").isEqualTo(PlanErrorCode.PLAN_PRIVATE);
    }

    private static User user(int userId) {
        User user = User.builder().userNickname("user" + userId).build();
        ReflectionTestUtils.setField(user, "userId", userId);
        return user;
    }
}
