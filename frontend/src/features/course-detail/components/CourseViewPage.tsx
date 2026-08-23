'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  MapPin,
  Clock,
  Check,
  MessageCircle,
  ThumbsUp,
  MoreVertical,
  Trash2,
  X,
  Plus,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { ShareBottomSheet } from '@/shared/ui/ShareBottomSheet';
import { BottomActionBar } from '@/shared/ui/BottomActionBar';
import { CourseDetailSkeleton } from '@/shared/ui/Skeleton';
import { useReport, ReportDialog, ReportMenuItem } from '@/features/report';
import * as hiddenReportsStorage from '@/features/report/utils/hiddenReportsStorage';
import type { CurrentUser, ReportTarget } from '@/features/report';
import { usePlanDetail, usePlanActions, planApi } from '@/features/plan';
import { useComments } from '../hooks/useComments';

interface CourseViewPageProps {
  courseId: string;
}

export function CourseViewPage({ courseId }: CourseViewPageProps) {
  const router = useRouter();

  // 플랜 상세는 서버에서만 조회한다. 실패 시 에러 UI를 렌더링한다.
  const { plan, isLoading: isPlanLoading, error: planError, refetch } = usePlanDetail(courseId);
  const planActions = usePlanActions(plan);

  const { user, isLoggedIn } = useUserStore();
  const currentUser: CurrentUser = {
    id: user?.id ?? '',
    name: user?.name ?? '',
    isLoggedIn,
  };

  const reportMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const reportCtx = useReport();

  const {
    comments,
    isLoading: isCommentsLoading,
    hasNext,
    isFetchingMore,
    commentText,
    setCommentText,
    replyTarget,
    setReplyTarget,
    deleteTarget,
    setDeleteTarget,
    submitComment,
    confirmDelete,
    toggleCommentLike,
    hideComment,
    fetchMore,
    fetchMoreReplies,
    fetchingRepliesFor,
  } = useComments(courseId);

  const [shareOpen, setShareOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedCourseId, setSavedCourseId] = useState<string | null>(null);
  // 어느 댓글의 메뉴인지 추적 — race condition 차단 (Architect C-3)
  const [commentMenuTarget, setCommentMenuTarget] = useState<ReportTarget | null>(null);

  if (isPlanLoading) {
    return <CourseDetailSkeleton />;
  }

  // 에러 UI — 데이터 로드 실패 또는 존재하지 않는 플랜
  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <X size={28} className="text-gray-400" />
        </div>
        <p className="text-gray-900 font-bold mb-1">
          {planError ?? '플랜 정보를 불러오지 못했어요.'}
        </p>
        <p className="text-sm text-gray-500 mb-6">잠시 후 다시 시도해주세요.</p>
        <div className="flex gap-2 w-full max-w-xs">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm"
          >
            돌아가기
          </button>
          <button
            onClick={refetch}
            className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl text-sm shadow-md shadow-primary-200"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const bookmarked = planActions.isScrapped;
  const liked = planActions.isLiked;
  const likeCount = planActions.likeCount;
  const scrapCount = planActions.scrapCount;

  const places = [...plan.planPlaceDetailDtos].sort((a, b) => a.orderIndex - b.orderIndex);
  const heroImage =
    plan.thumbnailUrl ||
    plan.planImageUrls[0] ||
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1080&auto=format&fit=crop';
  const locationLabel = places[0]?.address?.split(' ').slice(0, 2).join(' ') || '';
  const durationLabel =
    plan.requiredTime >= 60
      ? `${Math.floor(plan.requiredTime / 60)}시간${plan.requiredTime % 60 ? ` ${plan.requiredTime % 60}분` : ''}`
      : `${plan.requiredTime}분`;

  const courseTarget: ReportTarget = {
    type: 'course',
    id: courseId,
    ownerId: plan.userNickname, // A7: 닉네임 best-effort 매칭
    title: plan.planTitle,
    contextUrl: `/course/${courseId}`,
  };

  const handleSaveCourse = () => {
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    try {
      // 빠른 담기 플로우 — scheduledDate 미선택이므로 오늘 날짜(YYYY-MM-DD)를 기본값으로 전송
      const scheduledDate = new Date().toISOString().slice(0, 10);
      const res = await planApi.clonePlan(plan.planId, { scheduledDate });
      setSavedCourseId(String(res.planId));
      toast.success('내 일정에 담았어요!');
    } catch {
      toast.error('일정 담기에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const goToMyCourse = () => {
    if (savedCourseId) {
      router.push(`/course/${savedCourseId}`);
    }
    setShowSaveModal(false);
    setSavedCourseId(null);
  };

  return (
    <div className="bg-white pb-24 min-h-dvh relative">
      {/* 히어로 이미지 */}
      <div className="relative h-64 w-full">
        <Image
          src={heroImage}
          alt={plan.planTitle}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/40 to-transparent">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShareOpen(true)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent text-white">
          <div className="flex gap-2 mb-2">
            {plan.tags.map((tag, idx) => (
              <span key={idx} className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold leading-tight mb-1">{plan.planTitle}</h1>
          <div className="flex items-center text-sm opacity-90">
            <MapPin size={14} className="mr-1" /> {locationLabel}
          </div>
        </div>
      </div>

      {/* 작성자 & 팔로우 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer active:opacity-70"
          onClick={() => router.push(`/profile/${plan.userId}`)}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
            {plan.userAvatar ? (
              <Image
                src={plan.userAvatar}
                alt={plan.userNickname}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <User size={20} className="text-gray-400" />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{plan.userNickname}</div>
            <div className="text-xs text-gray-500">여행 크리에이터</div>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={planActions.toggleLike}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 font-bold text-sm transition-all ${
            liked
              ? 'bg-red-50 border-red-400 text-red-500'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <Heart size={16} className={liked ? 'fill-red-400 text-red-400' : ''} />
          {(likeCount ?? 0).toLocaleString()}
        </motion.button>
      </div>

      {/* 정보 그리드 */}
      <div className="grid grid-cols-3 gap-1 p-4 text-center">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">소요시간</div>
          <div className="font-bold text-gray-900">{durationLabel}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">스크랩</div>
          <div className="font-bold text-gray-900 flex items-center justify-center gap-1">
            <Bookmark size={14} className="text-primary-500" /> {scrapCount}
          </div>
        </div>
        <button
          onClick={planActions.toggleLike}
          className="bg-gray-50 p-3 rounded-lg active:bg-gray-100 transition-colors"
        >
          <div className="text-xs text-gray-500 mb-1">좋아요</div>
          <div className="font-bold text-gray-900 flex items-center justify-center gap-1">
            <Heart size={14} className={liked ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
            {likeCount}
          </div>
        </button>
      </div>

      {/* 설명 */}
      <div className="px-5 py-2 mb-6">
        <p className="text-gray-600 text-sm leading-relaxed">{plan.planDescription}</p>
      </div>

      {/* 타임라인 */}
      <div className="px-5">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock size={20} className="text-primary-500" /> 여행 플랜 타임라인
        </h2>
        <div className="relative pl-2 space-y-8 before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-primary-200 before:to-gray-100 before:content-['']">
          {places.map((stop) => (
            <div key={stop.planPlaceId} className="relative pl-8">
              <span className="absolute left-0 top-1.5 -ml-px h-4 w-4 rounded-full border-2 border-white bg-primary-500 shadow-sm z-10" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded w-fit mb-1">
                  {stop.visitTime}
                </span>
                <span className="text-xs text-gray-400 font-medium ml-auto sm:ml-2">
                  {stop.categoryName}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{stop.placeName}</h3>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {stop.stayDescription || stop.address}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 댓글 */}
      <div className="px-5 py-4 border-t border-gray-100 mt-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <MessageCircle size={20} className="text-primary-500" /> 댓글
        </h2>
        <div className="mb-4">
          {replyTarget && (
            <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 mb-2 text-sm text-primary-700">
              <span><span className="font-bold">@{replyTarget.username}</span>에게 답글</span>
              <button onClick={() => setReplyTarget(null)} aria-label="답글 취소">
                <X size={14} />
              </button>
            </div>
          )}
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={replyTarget ? `@${replyTarget.username}에게 답글...` : '댓글을 입력하세요...'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-base"
            rows={2}
            maxLength={500}
          />
          <button
            onClick={submitComment}
            className="mt-2 w-full bg-primary-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 active:scale-[0.98] transition-transform"
          >
            {replyTarget ? '답글 작성' : '댓글 작성'}
          </button>
        </div>
        {isCommentsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-10 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.replyId}>
                {/* 부모 댓글 */}
                <div className="flex items-start gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={comment.avatar} alt="Avatar" fill sizes="36px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-gray-900">{comment.user}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1 whitespace-pre-wrap">
                      {comment.isDeleted ? '삭제된 댓글입니다.' : comment.content}
                    </p>
                    {!comment.isDeleted && (
                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        onClick={() => toggleCommentLike(comment.replyId, comment.isLiked, null)}
                        className={`flex items-center gap-1 text-sm ${comment.isLiked ? 'text-primary-500' : 'text-gray-400'}`}
                      >
                        <ThumbsUp size={14} />
                        <span>{comment.likeCount}</span>
                      </button>
                      <button
                        onClick={() =>
                          setReplyTarget({
                            replyId: comment.replyId,
                            username: comment.user,
                            userId: comment.userId,
                          })
                        }
                        className="text-xs text-gray-400 hover:text-primary-500"
                      >
                        답글
                      </button>
                      {comment.user === currentUser.name ? (
                        <button
                          onClick={() =>
                            setDeleteTarget({ replyId: comment.replyId, content: comment.content, parentId: null })
                          }
                          aria-label="댓글 삭제"
                          className="ml-auto text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setCommentMenuTarget({
                              type: 'comment',
                              id: String(comment.replyId),
                              ownerId: comment.user,
                              courseId,
                              snippet: comment.content.slice(0, 60),
                              contextUrl: `/course/${courseId}#comment-${comment.replyId}`,
                            })
                          }
                          aria-label="댓글 더보기"
                          className="ml-auto text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical size={14} />
                        </button>
                      )}
                    </div>
                    )}
                  </div>
                </div>

                {/* 대댓글 */}
                {(comment.replies.replies.length > 0 || comment.replies.hasNext) && (
                  <div className="ml-12 mt-3 space-y-3 border-l-2 border-gray-100 pl-3">
                    {comment.replies.replies.map((reply) => (
                      <div key={reply.replyId} className="flex items-start gap-3">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={reply.avatar} alt="Avatar" fill sizes="28px" className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-gray-900">{reply.user}</div>
                            <div className="text-[10px] text-gray-400">
                              {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-1 whitespace-pre-wrap">
                            {reply.isDeleted ? '삭제된 댓글입니다.' : reply.content}
                          </p>
                          {!reply.isDeleted && (
                          <div className="flex items-center gap-3 mt-1">
                            <button
                              onClick={() => toggleCommentLike(reply.replyId, reply.isLiked, comment.replyId)}
                              className={`flex items-center gap-1 text-xs ${reply.isLiked ? 'text-primary-500' : 'text-gray-400'}`}
                            >
                              <ThumbsUp size={12} />
                              <span>{reply.likeCount}</span>
                            </button>
                            {reply.user === currentUser.name ? (
                              <button
                                onClick={() =>
                                  setDeleteTarget({
                                    replyId: reply.replyId,
                                    content: reply.content,
                                    parentId: comment.replyId,
                                  })
                                }
                                aria-label="답글 삭제"
                                className="ml-auto text-gray-400 hover:text-red-500"
                              >
                                <Trash2 size={12} />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setCommentMenuTarget({
                                    type: 'comment',
                                    id: String(reply.replyId),
                                    ownerId: reply.user,
                                    courseId,
                                    snippet: reply.content.slice(0, 60),
                                    contextUrl: `/course/${courseId}#comment-${reply.replyId}`,
                                  })
                                }
                                aria-label="답글 더보기"
                                className="ml-auto text-gray-400 hover:text-gray-600"
                              >
                                <MoreVertical size={12} />
                              </button>
                            )}
                          </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {comment.replies.hasNext && (
                      <button
                        type="button"
                        onClick={() => fetchMoreReplies(comment.replyId)}
                        disabled={fetchingRepliesFor === comment.replyId}
                        className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        {fetchingRepliesFor === comment.replyId ? '불러오는 중...' : '답글 더보기'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {hasNext && (
              <button
                onClick={fetchMore}
                disabled={isFetchingMore}
                className="w-full py-2.5 text-sm text-primary-600 font-medium border border-primary-200 rounded-xl hover:bg-primary-50 disabled:opacity-50"
              >
                {isFetchingMore ? '불러오는 중...' : '댓글 더 보기'}
              </button>
            )}
          </div>
        )}
      </div>

      <BottomActionBar
        iconActions={[
          {
            id: 'like',
            icon: Heart,
            label: '좋아요',
            active: liked,
            activeTone: 'like',
            filled: true,
            onClick: planActions.toggleLike,
          },
          {
            id: 'bookmark',
            icon: Bookmark,
            label: '스크랩',
            active: bookmarked,
            activeTone: 'bookmark',
            filled: true,
            onClick: planActions.toggleScrap,
          },
        ]}
        primaryLabel="이 플랜으로 일정 담기"
        primaryIcon={Plus}
        onPrimaryClick={handleSaveCourse}
      />

      {/* ─── 모달: 일정 담기 ─── */}
      {showSaveModal && (
        <div className="fixed inset-y-0 app-frame z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSaveModal(false)} />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-6">
            {!savedCourseId ? (
              <>
                <h3 className="font-bold text-lg mb-2 text-gray-900">내 일정으로 담기</h3>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-bold text-gray-700">&ldquo;{plan.planTitle}&rdquo;</span>
                </p>
                <p className="text-sm text-gray-500 mb-5">
                  이 플랜을 내 일정에 추가하시겠어요?
                  <br />
                  담은 후 날짜와 순서를 수정할 수 있어요.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm text-gray-600"
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmSave}
                    className="flex-1 py-3 bg-primary-500 font-bold rounded-xl text-sm text-white shadow-md shadow-primary-200"
                  >
                    담기
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-500">
                  <Check size={24} strokeWidth={3} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">일정에 담았어요!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  내 플랜 상세에서 날짜를 설정하고
                  <br />
                  여행을 시작해보세요.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      setSavedCourseId(null);
                    }}
                    className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm text-gray-600"
                  >
                    계속 구경하기
                  </button>
                  <button
                    onClick={goToMyCourse}
                    className="flex-1 py-3 bg-primary-500 font-bold rounded-xl text-sm text-white shadow-md shadow-primary-200"
                  >
                    플랜 보기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 더보기 메뉴 ─── */}
      {isMenuOpen && (
        <div className="fixed inset-y-0 app-frame z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-4 shadow-xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <button
              onClick={() => {
                planActions.toggleScrap();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
            >
              <Bookmark size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">플랜 저장 / 해제</span>
            </button>
            <ReportMenuItem
              target={courseTarget}
              currentUser={currentUser}
              onSelect={() => {
                setIsMenuOpen(false);
                reportCtx.open(courseTarget);
              }}
            />
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3 text-gray-400 font-bold text-sm mt-1"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ─── 신고 다이얼로그 (course/comment 공용 — target은 reportCtx.target에서 동적 결정) ─── */}
      <ReportDialog
        isOpen={reportCtx.isOpen}
        target={reportCtx.target ?? courseTarget}
        isSubmitting={reportCtx.isSubmitting}
        triggerRef={reportMenuTriggerRef}
        onSubmit={(rc, d) => reportCtx.submit(reportCtx.target ?? courseTarget, rc, d)}
        onClose={reportCtx.close}
        onHideContent={(t) => {
          if (t.type === 'comment') {
            // 댓글 신고 후 숨기기: 해당 댓글만 페이지에서 즉시 제거 + 로컬 스토리지에도 기록
            hideComment(t.id);
            hiddenReportsStorage.add(t);
          } else {
            // 플랜 신고 후 숨기기: 로컬 스토리지 기록 + 페이지 이탈
            hiddenReportsStorage.add(t);
            router.back();
          }
        }}
      />

      {/* ─── 댓글 더보기 인라인 시트 ─── */}
      {/* BottomMenu는 items: MenuItem[] 배열만 지원하고 children/slot 미지원이므로
          기존 isMenuOpen 패턴(인라인 bottom-sheet)을 재사용한다 (PR-4 범위 내 최소 침습) */}
      {commentMenuTarget !== null && (
        <div className="fixed inset-y-0 app-frame z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCommentMenuTarget(null)}
          />
          <div className="relative w-full bg-white rounded-t-3xl p-4 shadow-xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <ReportMenuItem
              target={commentMenuTarget}
              currentUser={currentUser}
              onSelect={() => {
                const target = commentMenuTarget;
                setCommentMenuTarget(null);
                reportCtx.open(target);
              }}
            />
            <button
              onClick={() => setCommentMenuTarget(null)}
              className="w-full py-3 text-gray-400 font-bold text-sm mt-1"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ─── 댓글 삭제 확인 모달 ─── */}
      {deleteTarget && (
        <div className="fixed inset-y-0 app-frame z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-[320px] bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-gray-900 text-lg font-bold mb-2">댓글을 삭제하시겠어요?</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              삭제된 댓글은 복구할 수 없습니다.
            </p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-5 line-clamp-3">
              {deleteTarget.content}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-sm hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-red-200 hover:bg-red-600"
              >
                삭제하기
              </button>
            </div>
            <button
              onClick={() => setDeleteTarget(null)}
              aria-label="닫기"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <ShareBottomSheet isOpen={shareOpen} onClose={() => setShareOpen(false)} title={plan.planTitle} />
    </div>
  );
}
