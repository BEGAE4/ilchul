'use client';

import React, { useState, useEffect } from 'react';
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
  Star,
  Navigation,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';
import { ShareBottomSheet } from '@/shared/ui/ShareBottomSheet';
import { PlaceAddSheet } from '@/shared/ui/PlaceAddSheet';
import { ScrollCarousel } from '@/shared/ui/ScrollCarousel';
import {
  MOCK_COURSES,
  NATIONWIDE_COURSES,
  BEST_PLACES,
  NEARBY_POPULAR_PLACES,
  NATIONWIDE_PLACES,
} from '@/shared/data/mockData';
import type { BestPlace, Course } from '@/shared/types';

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

const MOCK_PLACE_REVIEWS = [
  {
    id: 'pr1',
    user: '여행조아',
    avatar: 'https://i.pravatar.cc/150?u=pr1',
    rating: 5,
    comment: '분위기가 너무 좋아요! 다음에 또 올 거예요 😊',
    date: '2일 전',
    image:
      'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'pr2',
    user: '감성충만',
    avatar: 'https://i.pravatar.cc/150?u=pr2',
    rating: 4,
    comment: '사진 찍기 좋은 곳이에요. 주말에는 사람이 많으니 평일 방문 추천!',
    date: '5일 전',
  },
  {
    id: 'pr3',
    user: '먹스타그램',
    avatar: 'https://i.pravatar.cc/150?u=pr3',
    rating: 5,
    comment: '여기 진짜 최고... 강력 추천합니다 👍',
    date: '1주 전',
  },
];

const ALL_PLACES = [...BEST_PLACES, ...NEARBY_POPULAR_PLACES, ...NATIONWIDE_PLACES];
const ALL_COURSES = [...MOCK_COURSES, ...NATIONWIDE_COURSES];

interface PlaceDetailPageProps {
  placeId: string;
}

export function PlaceDetailPage({ placeId }: PlaceDetailPageProps) {
  const router = useRouter();
  const { toggleBookmark, isBookmarked } = useCourseStore();

  const [place, setPlace] = useState<BestPlace | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const bookmarked = isBookmarked(placeId);

  useEffect(() => {
    // 로컬 mock 데이터에서 장소 조회
    const found = ALL_PLACES.find((p) => p.id === placeId);
    if (found) {
      setPlace(found);
      setLikeCount(found.likes);
      // 같은 location의 코스를 관련 코스로
      const related = ALL_COURSES.filter(
        (c) => c.location === found.location || c.stops.some((s) => s.name === found.name)
      ).slice(0, 5);
      setRelatedCourses(related);
    }
    setTimeout(() => setIsLoading(false), 400);
  }, [placeId]);

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleBookmark = () => {
    toggleBookmark(placeId);
    toast.success(bookmarked ? '북마크를 해제했어요.' : '북마크에 저장했어요!');
  };

  if (isLoading || !place) {
    return <PlaceDetailSkeleton />;
  }

  const detail = PLACE_DETAILS[place.category] || DEFAULT_DETAIL;

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
          <span className="inline-block px-2.5 py-1 mb-2 text-[10px] font-bold bg-sky-500 rounded text-white">
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
            className={`transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
          />
          <span className="text-xs font-bold text-gray-600">{likeCount.toLocaleString()}</span>
        </button>
        <button
          onClick={handleBookmark}
          className="flex flex-col items-center py-4 gap-1 border-x border-gray-100 active:bg-gray-50 transition-colors"
        >
          <Bookmark
            size={20}
            className={`transition-colors ${bookmarked ? 'text-sky-500 fill-sky-500' : 'text-gray-400'}`}
          />
          <span className="text-xs font-bold text-gray-600">스크랩</span>
        </button>
        <button
          onClick={() => window.open(`https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.location}`, '_blank')}
          className="flex flex-col items-center py-4 gap-1 active:bg-gray-50 transition-colors"
        >
          <Navigation size={20} className="text-sky-500" />
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
              className="px-2.5 py-1 bg-sky-50 text-sky-600 text-[11px] font-bold rounded-full"
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
            <div className="text-sm font-bold text-gray-900">{detail.hours}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
          <Phone size={16} className="text-gray-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 mb-0.5">전화번호</div>
            <div className="text-sm font-bold text-gray-900">{detail.phone}</div>
          </div>
          <a href={`tel:${detail.phone}`} className="text-sky-500 text-xs font-bold active:text-sky-700">전화하기</a>
        </div>
        <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
          <MapPin size={16} className="text-gray-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 mb-0.5">주소</div>
            <div className="text-sm font-bold text-gray-900">{place.location}</div>
          </div>
          <button
            onClick={() => window.open(`https://map.kakao.com/link/search/${encodeURIComponent(place.name)}`, '_blank')}
            className="text-sky-500 text-xs font-bold flex items-center gap-0.5 active:text-sky-700"
          >
            지도 <ExternalLink size={10} />
          </button>
        </div>
      </div>

      {/* 방문자 후기 */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900">방문자 후기</h2>
          <span className="text-xs text-gray-400">{MOCK_PLACE_REVIEWS.length}개의 후기</span>
        </div>

        <div className="space-y-4">
          {MOCK_PLACE_REVIEWS.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={review.avatar} alt={review.user} fill sizes="32px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900">{review.user}</div>
                  <div className="text-[10px] text-gray-400">{review.date}</div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              {review.image && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden mt-2">
                  <Image src={review.image} alt="review" fill sizes="100%" className="object-cover" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 이 장소가 포함된 코스 */}
      {relatedCourses.length > 0 && (
        <div className="py-4 border-t border-gray-100">
          <div className="px-5 mb-3 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">이 장소가 포함된 코스</h2>
            <span className="text-xs text-gray-400">{relatedCourses.length}개</span>
          </div>
          <div className="px-4">
            <ScrollCarousel slidesToShow={1.15} gap={12}>
              {relatedCourses.map((course) => (
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

      {/* Sticky 하단 CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-[480px] mx-auto bg-white border-t border-gray-100 px-5 py-3 flex gap-3">
          <button
            onClick={handleLike}
            className={`px-4 py-3 rounded-xl border transition-all active:scale-95 ${
              isLiked ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            <Heart size={20} className={isLiked ? 'fill-red-500' : ''} />
          </button>
          <button
            onClick={() => setIsAddSheetOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-sky-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-200 active:scale-[0.98] transition-transform"
          >
            <Plus size={18} strokeWidth={3} />
            내 코스에 담기
          </button>
        </div>
      </div>

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
