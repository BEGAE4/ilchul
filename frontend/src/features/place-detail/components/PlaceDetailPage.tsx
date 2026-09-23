'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/shared/ui/Avatar';
import CoverImage from '@/shared/ui/CoverImage';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Phone,
  Share2,
  Plus,
  Navigation,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ShareBottomSheet } from '@/shared/ui/ShareBottomSheet';
import { BottomActionBar } from '@/shared/ui/BottomActionBar';
import { PlaceAddSheet } from '@/shared/ui/PlaceAddSheet';
import { ScrollCarousel } from '@/shared/ui/ScrollCarousel';
import type { BestPlace } from '@/shared/types';
import { usePlaceDetail, usePlaceActions } from '@/features/place';
import { Map as KakaoMap, MapMarker } from 'react-kakao-maps-sdk';
import { useKakaoMapLoader } from '@/shared/lib/kakao';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { isMine } from '@/shared/lib/auth/isMine';
import { useLoginGate } from '@/features/authentication/hooks';

interface PlaceDetailPageProps {
  placeId: string;
}

export function PlaceDetailPage({ placeId }: PlaceDetailPageProps) {
  const router = useRouter();

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // 장소 상세/후기/포함 플랜은 모두 서버 API로 조회한다 (GET /api/place/{placeId} 등)
  const {
    place: serverPlace,
    reviews: serverReviews,
    totalReviewCount,
    editReview,
    removeReview,
    reviewsError,
    hasMoreReviews,
    isFetchingMoreReviews,
    fetchMoreReviews,
    submitReview,
    isSubmittingReview,
    relatedPlans: serverPlans,
    isLoading: isServerLoading,
    error: serverError,
    requiresAuth,
  } = usePlaceDetail(placeId);
  const [reviewInput, setReviewInput] = useState('');
  // 내 후기 수정·삭제 (2026-09-18 백엔드 추가). 내 것인지는 숫자 id 로 판별한다 — isMine 참고
  const { user, userId: myUserId, isLoggedIn } = useUserStore();
  const me = { isLoggedIn, userId: myUserId, name: user?.name };
  const [editingReview, setEditingReview] = useState<{ id: number; text: string } | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [deleteReviewTarget, setDeleteReviewTarget] = useState<{ id: number; content: string } | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  // 위치 미니맵용 카카오맵 SDK 로드 상태
  const [isKakaoLoading, kakaoError] = useKakaoMapLoader();
  // 좋아요/스크랩: 상세 응답의 초기 상태로 시작하고, POST·DELETE /api/place/{placeId}/likes|scraps 응답값으로 확정한다.
  const placeActions = usePlaceActions(placeId, {
    initialIsLiked: serverPlace?.isLiked,
    initialLikeCount: serverPlace?.likeCount,
    initialIsScrapped: serverPlace?.isBookmarked,
    initialScrapCount: serverPlace?.bookmarkCount,
  });

  // 비로그인이면 좋아요·스크랩·후기·담기 대신 로그인 유도 모달을 띄운다
  const { requireLogin, promptLogin } = useLoginGate();

  const bookmarked = placeActions.isScrapped;
  const liked = placeActions.isLiked;
  const displayLikeCount = placeActions.likeCount;
  const handleLike = () => requireLogin(placeActions.toggleLike, '좋아요를 누르려면 로그인해주세요.');
  const handleBookmark = () => requireLogin(placeActions.toggleScrap, '장소를 북마크하려면 로그인해주세요.');
  const openAddSheet = () => requireLogin(() => setIsAddSheetOpen(true), '장소를 내 플랜에 담으려면 로그인해주세요.');

  if (isServerLoading) {
    return <PlaceDetailSkeleton />;
  }

  // 서버에 없는 장소(목데이터 id 등)이거나 조회 실패 시 에러 화면
  if (!serverPlace || !placeActions.isServerPlace) {
    return (
      <PlaceDetailError
        message={serverError}
        requiresAuth={requiresAuth}
        onBack={() => router.back()}
        onLogin={() => promptLogin('장소 정보를 보려면 먼저 로그인해주세요.')}
      />
    );
  }

  const place: BestPlace = {
    id: String(serverPlace.placeId),
    name: serverPlace.placeName,
    category: serverPlace.categoryName,
    location: serverPlace.roadAddressName || serverPlace.addressName,
    // 사진이 없으면 빈 값으로 두고 CoverImage 가 기본 커버를 그린다 (구름 사진으로 채우지 않는다)
    image: serverPlace.placeImageUrl || '',
    likes: placeActions.likeCount,
  };

  const phone = serverPlace.phone || '';

  // 후기: v5 후기 API 데이터 (별점 없음)
  const displayReviews = serverReviews.map((r) => ({
    id: String(r.reviewId),
    reviewId: r.reviewId,
    isMine: isMine(me, { userId: r.userId, nickname: r.userNickname }),
    user: r.userNickname,
    avatar: r.userImg || '',
    comment: r.content,
    date: new Date(r.createAt).toLocaleDateString('ko-KR'),
  }));

  // 이 장소가 포함된 플랜: GET /api/place/{placeId}/plan
  const displayRelated = serverPlans.map((p) => ({
    id: String(p.id),
    title: p.title,
    thumbnail: p.thumbnail,
    location: p.location,
    likes: p.likes,
    tags: [] as string[],
  }));

  return (
    <div className="bg-white min-h-dvh pb-24">
      {/* 히어로 이미지 */}
      <div className="relative h-72">
        <CoverImage src={place.image} alt={place.name} seed={place.id} size="lg" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* 상단 버튼 */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white active:bg-black/50"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white active:bg-black/50"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={handleBookmark}
              className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white active:bg-black/50"
            >
              {bookmarked ? (
                <BookmarkCheck size={18} className="fill-white" />
              ) : (
                <Bookmark size={18} />
              )}
            </button>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="inline-block px-2.5 py-1 mb-2 text-[10px] font-bold bg-primary-500 rounded text-white">
            {place.category}
          </span>
          <h1 className="text-2xl font-bold text-white leading-tight mb-1">{place.name}</h1>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <MapPin size={13} />
            <span>{place.location}</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 border-b border-gray-100">
        <button
          onClick={handleLike}
          className="flex flex-col items-center py-4 gap-1 active:bg-gray-50 transition-colors"
        >
          <Heart
            size={20}
            className={`transition-colors ${liked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
          />
          <span className="text-xs font-bold text-gray-600">{(displayLikeCount ?? 0).toLocaleString()}</span>
        </button>
        <button
          onClick={handleBookmark}
          className="flex flex-col items-center py-4 gap-1 border-x border-gray-100 active:bg-gray-50 transition-colors"
        >
          <Bookmark
            size={20}
            className={`transition-colors ${bookmarked ? 'text-primary-500 fill-primary-500' : 'text-gray-400'}`}
          />
          <span className="text-xs font-bold text-gray-600">스크랩</span>
        </button>
        <button
          onClick={() =>
            window.open(
              // kakao link/to 형식: 이름,위도,경도
              `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${serverPlace.y},${serverPlace.x}`,
              '_blank'
            )
          }
          className="flex flex-col items-center py-4 gap-1 active:bg-gray-50 transition-colors"
        >
          <Navigation size={20} className="text-primary-500" />
          <span className="text-xs font-bold text-gray-600">길찾기</span>
        </button>
      </div>

      {/* 정보 섹션 */}
      {/* NOTE: v5 상세 응답(PlaceDetailResponseDto)에 소개글/해시태그/영업시간 필드가 없어
          해당 UI는 표시하지 않는다. BE에 필드 추가 시 복원 예정 (문서: cc/result 참고) */}
      <div className="px-5 pt-5 pb-5 space-y-3">
        <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
          <Phone size={16} className="text-gray-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 mb-0.5">전화번호</div>
            <div className="text-sm font-bold text-gray-900">{phone || '-'}</div>
          </div>
          {phone && (
            <a href={`tel:${phone}`} className="text-primary-500 text-xs font-bold active:text-primary-700">전화하기</a>
          )}
        </div>
        <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
          <MapPin size={16} className="text-gray-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 mb-0.5">주소</div>
            <div className="text-sm font-bold text-gray-900">{place.location}</div>
          </div>
          <button
            onClick={() =>
              window.open(
                serverPlace.placeUrl ||
                  `https://map.kakao.com/link/search/${encodeURIComponent(place.name)}`,
                '_blank'
              )
            }
            className="text-primary-500 text-xs font-bold flex items-center gap-0.5 active:text-primary-700"
          >
            지도 <ExternalLink size={10} />
          </button>
        </div>

        {/* 위치 미니맵 */}
        {!kakaoError && (
          <div className="rounded-xl overflow-hidden border border-gray-100">
            {isKakaoLoading ? (
              <div className="h-40 bg-gray-100 animate-pulse" />
            ) : (
              <KakaoMap
                center={{ lat: serverPlace.y, lng: serverPlace.x }}
                style={{ width: '100%', height: 160 }}
                level={4}
                draggable={false}
                zoomable={false}
              >
                <MapMarker position={{ lat: serverPlace.y, lng: serverPlace.x }} />
              </KakaoMap>
            )}
          </div>
        )}
      </div>

      {/* 방문자 후기 */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900">방문자 후기</h2>
          <span className="text-xs text-gray-400">{totalReviewCount}개의 후기</span>
        </div>

        {/* 후기 작성 폼 — POST /api/place/{placeId}/review */}
        <div className="mb-5">
          <textarea
            value={reviewInput}
            onChange={(e) => setReviewInput(e.target.value)}
            placeholder="이 장소는 어땠나요? 후기를 남겨보세요."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-base"
            rows={2}
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] text-gray-400">{reviewInput.length}/1000</span>
            <button
              onClick={() =>
                requireLogin(async () => {
                  const ok = await submitReview(reviewInput);
                  if (ok) setReviewInput('');
                }, '후기를 남기려면 로그인해주세요.')
              }
              disabled={isSubmittingReview || !reviewInput.trim()}
              className="px-4 py-2 bg-primary-500 text-white text-sm font-bold rounded-lg shadow-sm shadow-primary-200 active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              {isSubmittingReview ? '등록 중...' : '후기 작성'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {displayReviews.length === 0 &&
            (reviewsError ? (
              <p className="text-center py-4 text-xs text-gray-400">
                후기를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
              </p>
            ) : (
              <p className="text-center py-4 text-xs text-gray-400">
                아직 후기가 없어요. 첫 후기를 남겨보세요!
              </p>
            ))}
          {displayReviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <Avatar src={review.avatar} alt={review.user} size={32} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900">{review.user}</div>
                  <div className="text-[10px] text-gray-400">{review.date}</div>
                </div>
                {review.isMine && editingReview?.id !== review.reviewId && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingReview({ id: review.reviewId, text: review.comment })}
                      aria-label="후기 수정"
                      className="p-1.5 text-gray-400 hover:text-primary-500"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteReviewTarget({ id: review.reviewId, content: review.comment })}
                      aria-label="후기 삭제"
                      className="p-1.5 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              {editingReview?.id === review.reviewId ? (
                <div>
                  <textarea
                    value={editingReview.text}
                    onChange={(e) => setEditingReview({ id: review.reviewId, text: e.target.value })}
                    maxLength={1000}
                    rows={3}
                    aria-label="후기 수정 내용"
                    className="w-full p-3 border border-primary-300 rounded-xl bg-white text-sm resize-none focus:outline-none focus:border-primary-500"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-gray-400">{editingReview.text.length}/1000</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingReview(null)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        disabled={
                          isSavingReview ||
                          !editingReview.text.trim() ||
                          editingReview.text.trim() === review.comment
                        }
                        onClick={async () => {
                          setIsSavingReview(true);
                          const ok = await editReview(review.reviewId, editingReview.text);
                          setIsSavingReview(false);
                          if (ok) setEditingReview(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-bold disabled:bg-gray-300"
                      >
                        {isSavingReview ? '저장 중...' : '저장'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
              )}
            </motion.div>
          ))}

          {/* 후기 더보기 — 커서 페이징 */}
          {hasMoreReviews && (
            <button
              onClick={fetchMoreReviews}
              disabled={isFetchingMoreReviews}
              className="w-full py-2.5 text-sm text-primary-600 font-medium border border-primary-200 rounded-xl hover:bg-primary-50 disabled:opacity-50"
            >
              {isFetchingMoreReviews ? '불러오는 중...' : '후기 더 보기'}
            </button>
          )}
        </div>
      </div>

      {/* 이 장소가 포함된 플랜 */}
      {displayRelated.length > 0 && (
        <div className="py-4 border-t border-gray-100">
          <div className="px-5 mb-3 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">이 장소가 포함된 플랜</h2>
            <span className="text-xs text-gray-400">{displayRelated.length}개</span>
          </div>
          <div className="px-4">
            <ScrollCarousel slidesToShow={1.15} gap={12}>
              {displayRelated.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform w-52 shrink-0"
                  onClick={() => router.push(`/course/${course.id}`)}
                >
                  <div className="relative h-32">
                    <CoverImage
                      src={course.thumbnail}
                      alt={course.title}
                      seed={course.id}
                      size="sm"
                      sizes="208px"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2.5 flex gap-1.5">
                      {course.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-white bg-white/20 backdrop-blur-sm rounded px-1.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">
                      {course.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={10} />
                        <span>{course.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={10} className="text-red-400 fill-red-400" />
                        <span className="text-xs font-bold text-gray-500">{course.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollCarousel>
          </div>
        </div>
      )}

      <BottomActionBar
        iconActions={[
          {
            id: 'like',
            icon: Heart,
            label: '좋아요',
            active: liked,
            activeTone: 'like',
            filled: true,
            onClick: handleLike,
          },
          {
            id: 'bookmark',
            icon: Bookmark,
            label: '스크랩',
            active: bookmarked,
            activeTone: 'bookmark',
            filled: true,
            onClick: handleBookmark,
          },
        ]}
        primaryLabel="내 플랜에 담기"
        primaryIcon={Plus}
        onPrimaryClick={openAddSheet}
      />

      <PlaceAddSheet
        open={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        place={place}
      />

      {/* ─── 후기 삭제 확인 모달 — 플랜 댓글 삭제와 같은 모양 ─── */}
      {deleteReviewTarget && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteReviewTarget(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="후기 삭제 확인"
            className="relative w-full max-w-[320px] bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-gray-900 text-lg font-bold mb-2">후기를 삭제하시겠어요?</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">삭제된 후기는 복구할 수 없습니다.</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-5 line-clamp-3">
              {deleteReviewTarget.content}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteReviewTarget(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-sm hover:bg-gray-200"
              >
                취소
              </button>
              <button
                disabled={isDeletingReview}
                onClick={async () => {
                  setIsDeletingReview(true);
                  await removeReview(deleteReviewTarget.id);
                  setIsDeletingReview(false);
                  setDeleteReviewTarget(null);
                }}
                className="flex-1 bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-red-200 hover:bg-red-600 disabled:opacity-60"
              >
                {isDeletingReview ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
            <button
              onClick={() => setDeleteReviewTarget(null)}
              aria-label="닫기"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <ShareBottomSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={place.name}
      />
    </div>
  );
}

/* ── Error ── */
function PlaceDetailError({
  message,
  requiresAuth = false,
  onBack,
  onLogin,
}: {
  message: string | null;
  requiresAuth?: boolean;
  onBack: () => void;
  onLogin?: () => void;
}) {
  return (
    <div className="bg-white min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <MapPin size={40} className="text-gray-300 mb-4" />
      <p className="text-base font-bold text-gray-900 mb-1">
        {requiresAuth ? '로그인이 필요해요' : '장소를 찾을 수 없어요'}
      </p>
      <p className="text-sm text-gray-500 mb-6">{message || '존재하지 않거나 삭제된 장소예요.'}</p>
      {requiresAuth && onLogin ? (
        <div className="flex flex-col items-center gap-2 w-full max-w-[240px]">
          <button
            onClick={onLogin}
            className="w-full px-5 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-transform"
          >
            로그인하러 가기
          </button>
          <button
            onClick={onBack}
            className="w-full px-5 py-2.5 text-gray-500 text-sm font-bold active:text-gray-700"
          >
            돌아가기
          </button>
        </div>
      ) : (
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-transform"
        >
          돌아가기
        </button>
      )}
    </div>
  );
}

/* ── Skeleton ── */
function PlaceDetailSkeleton() {
  const Sk = ({ className = '' }: { className?: string }) => (
    <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`} />
  );
  return (
    <div className="bg-white min-h-dvh pb-24">
      <Sk className="h-72 w-full rounded-none" />
      <div className="grid grid-cols-3 border-b border-gray-100 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Sk className="w-6 h-6 rounded-full" />
            <Sk className="w-10 h-3" />
          </div>
        ))}
      </div>
      <div className="p-5 space-y-3">
        <Sk className="w-full h-4" />
        <Sk className="w-4/5 h-4" />
        <div className="flex gap-2 pt-2">
          <Sk className="w-16 h-6 rounded-full" />
          <Sk className="w-16 h-6 rounded-full" />
        </div>
      </div>
      <div className="px-5 space-y-3">
        <Sk className="w-full h-14 rounded-xl" />
        <Sk className="w-full h-14 rounded-xl" />
        <Sk className="w-full h-14 rounded-xl" />
      </div>
    </div>
  );
}
