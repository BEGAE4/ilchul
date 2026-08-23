'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Clock,
  Phone,
  Share2,
  Plus,
  Navigation,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  User,
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

// 카테고리별 장소 상세 정보
const PLACE_DETAILS: Record<
  string,
  { description: string; hours: string; phone: string; tags: string[] }
> = {
  맛집: {
    description: '현지인들도 줄 서서 먹는 인기 맛집이에요. 정성 가득한 한 끼를 즐겨보세요.',
    hours: '11:00 - 21:00',
    phone: '02-1234-5678',
    tags: ['웨이팅 맛집', '가성비', '분위기 좋은'],
  },
  카페: {
    description: '감성적인 인테리어와 특별한 음료로 유명한 카페입니다. 여유로운 시간을 보내기 좋아요.',
    hours: '10:00 - 22:00',
    phone: '02-2345-6789',
    tags: ['감성카페', '디저트 맛집', '포토스팟'],
  },
  관광지: {
    description: '사계절 아름다운 풍경을 감상할 수 있는 인기 관광지예요.',
    hours: '상시 개방',
    phone: '1588-1234',
    tags: ['인생샷', '자연경관', '추천 명소'],
  },
  문화: {
    description: '역사와 문화가 살아 숨 쉬는 특별한 공간입니다. 여행의 깊이를 더해보세요.',
    hours: '09:00 - 18:00',
    phone: '033-456-7890',
    tags: ['역사탐방', '전통체험', '교육적'],
  },
  복합문화: {
    description: '쇼핑, 문화, 맛집이 한데 모인 복합문화공간이에요. 하루 종일 즐길 수 있어요.',
    hours: '10:30 - 22:00',
    phone: '02-3456-7890',
    tags: ['쇼핑', '데이트', '원스톱'],
  },
  쇼핑: {
    description: '트렌디한 브랜드부터 로컬 편집숍까지 다양한 쇼핑을 즐길 수 있는 공간이에요.',
    hours: '10:00 - 21:30',
    phone: '031-567-8901',
    tags: ['트렌디', '쇼핑천국', '주말 나들이'],
  },
  공원: {
    description: '도심 속 푸른 쉼터, 산책과 피크닉을 즐기기 좋은 공원이에요.',
    hours: '상시 개방',
    phone: '02-4567-8901',
    tags: ['피크닉', '산책로', '반려견 동반'],
  },
  힐링: {
    description: '지친 일상에서 벗어나 몸과 마음을 재충전할 수 있는 힐링 스팟이에요.',
    hours: '09:00 - 20:00',
    phone: '064-789-0123',
    tags: ['힐링', '휴식', '자연 속'],
  },
};

const DEFAULT_DETAIL = {
  description: '여행자들 사이에서 입소문 난 인기 장소입니다. 직접 방문해서 그 매력을 느껴보세요.',
  hours: '09:00 - 18:00',
  phone: '1588-0000',
  tags: ['인기', '추천', '당일치기'],
};

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
    hasMoreReviews,
    isFetchingMoreReviews,
    fetchMoreReviews,
    submitReview,
    isSubmittingReview,
    relatedPlans: serverPlans,
    isLoading: isServerLoading,
    error: serverError,
  } = usePlaceDetail(placeId);
  const [reviewInput, setReviewInput] = useState('');
  // 위치 미니맵용 카카오맵 SDK 로드 상태
  const [isKakaoLoading, kakaoError] = useKakaoMapLoader();
  // 좋아요/스크랩: POST·DELETE /api/place/{placeId}/likes|scraps 응답값으로 상태 확정
  const placeActions = usePlaceActions(placeId);

  const bookmarked = placeActions.isScrapped;
  const liked = placeActions.isLiked;
  const displayLikeCount = placeActions.likeCount;
  const handleLike = placeActions.toggleLike;
  const handleBookmark = placeActions.toggleScrap;

  if (isServerLoading) {
    return <PlaceDetailSkeleton />;
  }

  // 서버에 없는 장소(목데이터 id 등)이거나 조회 실패 시 에러 화면
  if (!serverPlace || !placeActions.isServerPlace) {
    return <PlaceDetailError message={serverError} onBack={() => router.back()} />;
  }

  const place: BestPlace = {
    id: String(serverPlace.placeId),
    name: serverPlace.placeName,
    category: serverPlace.categoryName,
    location: serverPlace.roadAddressName || serverPlace.addressName,
    image:
      serverPlace.placeImageUrl ||
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1080&auto=format&fit=crop',
    likes: placeActions.likeCount,
  };

  const detail = PLACE_DETAILS[place.category] || DEFAULT_DETAIL;
  const phone = serverPlace.phone || '';

  // 후기: v5 후기 API 데이터 (별점 없음)
  const displayReviews = serverReviews.map((r) => ({
    id: String(r.reviewId),
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
    <div className="bg-white min-h-screen pb-24">
      {/* 히어로 이미지 */}
      <div className="relative h-72">
        <Image src={place.image} alt={place.name} fill sizes="100vw" className="object-cover" />
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

      {/* 설명 + 해시태그 */}
      <div className="p-5">
        <p className="text-sm text-gray-700 leading-relaxed">{detail.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {detail.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-primary-50 text-primary-600 text-[11px] font-bold rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* 정보 섹션 */}
      <div className="px-5 pb-5 space-y-3">
        <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
          <Clock size={16} className="text-gray-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 mb-0.5">영업시간</div>
            {/* v5 상세 응답에 영업시간 없음 */}
            <div className="text-sm font-bold text-gray-900">-</div>
          </div>
        </div>
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
          <span className="text-xs text-gray-400">{displayReviews.length}개의 후기</span>
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
              onClick={async () => {
                const ok = await submitReview(reviewInput);
                if (ok) setReviewInput('');
              }}
              disabled={isSubmittingReview || !reviewInput.trim()}
              className="px-4 py-2 bg-primary-500 text-white text-sm font-bold rounded-lg shadow-sm shadow-primary-200 active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              {isSubmittingReview ? '등록 중...' : '후기 작성'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {displayReviews.length === 0 && (
            <p className="text-center py-4 text-xs text-gray-400">아직 후기가 없어요. 첫 후기를 남겨보세요!</p>
          )}
          {displayReviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  {review.avatar ? (
                    <Image src={review.avatar} alt={review.user} fill sizes="32px" className="object-cover" />
                  ) : (
                    <User size={16} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900">{review.user}</div>
                  <div className="text-[10px] text-gray-400">{review.date}</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
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
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      sizes="208px"
                      className="object-cover"
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
        onPrimaryClick={() => setIsAddSheetOpen(true)}
      />

      <PlaceAddSheet
        open={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        place={place}
      />

      <ShareBottomSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={place.name}
      />
    </div>
  );
}

/* ── Error ── */
function PlaceDetailError({ message, onBack }: { message: string | null; onBack: () => void }) {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <MapPin size={40} className="text-gray-300 mb-4" />
      <p className="text-base font-bold text-gray-900 mb-1">장소를 찾을 수 없어요</p>
      <p className="text-sm text-gray-500 mb-6">{message || '존재하지 않거나 삭제된 장소예요.'}</p>
      <button
        onClick={onBack}
        className="px-5 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-transform"
      >
        돌아가기
      </button>
    </div>
  );
}

/* ── Skeleton ── */
function PlaceDetailSkeleton() {
  const Sk = ({ className = '' }: { className?: string }) => (
    <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`} />
  );
  return (
    <div className="bg-white min-h-screen pb-24">
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
