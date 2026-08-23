'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  Clock,
  Heart,
  MapPin,
  Plus,
  Route,
  Search,
} from 'lucide-react';
import Image from '@/shared/ui/SafeImage';
import type { BestPlace } from '@/shared/types';
import { ScrollCarousel } from '@/shared/ui/ScrollCarousel';
import { PlaceAddSheet } from '@/shared/ui/PlaceAddSheet';
import { SearchResultsSkeleton } from '@/shared/ui/Skeleton';
import { searchAll } from '@/features/search/api/search.api';
import type {
  SearchPlaceResult,
  SearchPlanResult,
  SearchResultResponse,
} from '@/features/search/types/search.types';

const SEARCH_LIMIT = 30;

function mapSearchPlaceToBestPlace(item: SearchPlaceResult): BestPlace {
  return {
    id: String(item.placeId),
    name: item.placeName,
    category: item.categoryName,
    location: item.roadAddressName || item.addressName || '',
    image: item.placeImageUrl,
    likes: item.likeCount ?? 0,
  };
}

function formatRequiredTime(minutes: number): string {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

type ViewTab = '전체' | '플랜' | '장소';
const VIEW_TABS: ViewTab[] = ['전체', '플랜', '장소'];

export const SearchResultsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const initialTab = (searchParams.get('tab') as ViewTab) || '전체';

  const [activeViewTab, setActiveViewTab] = useState<ViewTab>(initialTab);
  const [selectedPlace, setSelectedPlace] = useState<BestPlace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<SearchResultResponse | null>(null);

  // 통합 검색 — GET /api/search (장소 + 플랜)
  React.useEffect(() => {
    if (!query) {
      setResult(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    searchAll(query, { page: 1, limit: SEARCH_LIMIT })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        console.error('통합 검색 실패:', err);
        if (!cancelled) setResult(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const filteredCourses = useMemo<SearchPlanResult[]>(
    () => [...(result?.plans ?? [])].sort((a, b) => b.likeCount - a.likeCount),
    [result]
  );

  const filteredPlaces = useMemo<BestPlace[]>(
    () =>
      [...(result?.places ?? [])]
        .sort((a, b) => b.likeCount - a.likeCount)
        .map(mapSearchPlaceToBestPlace),
    [result]
  );

  const totalCourses = result?.planTotalCount ?? filteredCourses.length;
  const totalPlaces = result?.placeTotalCount ?? filteredPlaces.length;

  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  return (
    <div className="pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.push('/search')}
            className="p-2 -ml-2 text-gray-700 active:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <div
            className="flex-1 mx-2 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700 truncate cursor-pointer active:bg-gray-200"
            onClick={() => router.push('/search')}
          >
            <span className="flex items-center gap-1.5">
              <Search size={14} className="text-gray-400 shrink-0" />
              {query || '전체 검색'}
            </span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="px-5 flex">
          {VIEW_TABS.map((tab) => {
            const count =
              tab === '플랜'
                ? totalCourses
                : tab === '장소'
                  ? totalPlaces
                  : totalCourses + totalPlaces;
            return (
              <button
                key={tab}
                onClick={() => setActiveViewTab(tab)}
                className={`flex-1 pb-2.5 text-sm font-bold text-center transition-all border-b-2 ${
                  activeViewTab === tab
                    ? 'text-gray-900 border-gray-900'
                    : 'text-gray-400 border-transparent'
                }`}
              >
                {tab}
                <span
                  className={`ml-1 text-xs ${
                    activeViewTab === tab ? 'text-primary-500' : 'text-gray-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 min-h-dvh">
        {/* 전체 탭 */}
        {activeViewTab === '전체' && (
          <div>
            {totalCourses === 0 && totalPlaces === 0 && (
              <div className="text-center py-16 px-5">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-500 mb-1">
                  &ldquo;{query}&rdquo; 검색 결과가 없어요
                </p>
                <p className="text-xs text-gray-400">다른 키워드로 검색해보세요</p>
              </div>
            )}

            {/* 장소 섹션 — 수평 스크롤 */}
            {filteredPlaces.length > 0 && (
              <div className="pt-4 pb-2">
                <div className="px-5 mb-2.5 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-900">
                    장소
                    <span className="ml-1.5 text-primary-500">{filteredPlaces.length}</span>
                  </h3>
                  {filteredPlaces.length > 3 && (
                    <button
                      onClick={() => setActiveViewTab('장소')}
                      className="text-xs text-gray-400 font-bold flex items-center gap-0.5"
                    >
                      전체보기 <ChevronDown size={12} className="rotate-[-90deg]" />
                    </button>
                  )}
                </div>
                <div className="px-4">
                  <ScrollCarousel gap={10}>
                    {filteredPlaces.slice(0, 6).map((place) => (
                      <PlaceCardSmall
                        key={place.id}
                        place={place}
                        onAdd={() => setSelectedPlace(place)}
                        onClick={() => router.push(`/place/${place.id}`)}
                      />
                    ))}
                  </ScrollCarousel>
                </div>
              </div>
            )}

            {/* 플랜 섹션 — 수직 리스트 */}
            {filteredCourses.length > 0 && (
              <div className="pt-4 px-4">
                <div className="px-1 mb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-900">
                    플랜
                    <span className="ml-1.5 text-primary-500">{filteredCourses.length}</span>
                  </h3>
                  {filteredCourses.length > 3 && (
                    <button
                      onClick={() => setActiveViewTab('플랜')}
                      className="text-xs text-gray-400 font-bold flex items-center gap-0.5"
                    >
                      전체보기 <ChevronDown size={12} className="rotate-[-90deg]" />
                    </button>
                  )}
                </div>
                {filteredCourses.slice(0, 4).map((course) => (
                  <CourseCard
                    key={course.planId}
                    course={course}
                    onClick={() => router.push(`/course/${course.planId}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 플랜 탭 */}
        {activeViewTab === '플랜' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 ml-1">
              <p className="text-sm text-gray-500">
                총 <span className="font-bold text-primary-500">{totalCourses}</span>개의 플랜
              </p>
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <Route size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">검색 결과가 없어요</p>
              </div>
            )}

            {filteredCourses.map((course) => (
              <CourseCard
                key={course.planId}
                course={course}
                onClick={() => router.push(`/course/${course.planId}`)}
              />
            ))}
          </div>
        )}

        {/* 장소 탭 */}
        {activeViewTab === '장소' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 ml-1">
              <p className="text-sm text-gray-500">
                총 <span className="font-bold text-primary-500">{totalPlaces}</span>개의 장소
              </p>
            </div>

            {filteredPlaces.length === 0 && (
              <div className="text-center py-12">
                <MapPin size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">검색 결과가 없어요</p>
              </div>
            )}

            {/* 2열 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              {filteredPlaces.map((place) => (
                <PlaceCardGrid
                  key={place.id}
                  place={place}
                  onAdd={() => setSelectedPlace(place)}
                  onClick={() => router.push(`/place/${place.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <PlaceAddSheet
        open={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
        place={selectedPlace}
      />
    </div>
  );
};

/* ── 서브 컴포넌트 ── */

interface CourseCardProps {
  course: SearchPlanResult;
  onClick: () => void;
}

// 검색 DTO에 isLiked/isBookmarked가 없어 토글 대신 카운트만 표시한다.
function CourseCard({ course, onClick }: CourseCardProps) {
  const requiredTime = formatRequiredTime(course.requiredTime);
  const matchedPlace = course.places?.find((p) => p.matched);
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-3 cursor-pointer active:scale-[0.99] transition-transform"
      onClick={onClick}
    >
      <div className="relative h-40 bg-gray-100">
        {course.thumbnailUrl && (
          <Image
            src={course.thumbnailUrl}
            alt={course.planTitle}
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
          />
        )}
        {course.matchedByPlace && matchedPlace && (
          <span className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <MapPin size={10} /> {matchedPlace.placeName} 포함
          </span>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-gray-900 text-sm mb-1">{course.planTitle}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{course.planDescription}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {requiredTime && (
              <span className="flex items-center gap-0.5">
                <Clock size={10} />
                {requiredTime}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Route size={10} />
              {course.places?.length ?? 0}곳
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-0.5">
              <Heart size={10} className="text-red-400" />
              {course.likeCount}
            </span>
            <span className="flex items-center gap-0.5">
              <Bookmark size={10} className="text-primary-400" />
              {course.scrapCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const PlaceCardSmall: React.FC<{
  place: BestPlace;
  onAdd: () => void;
  onClick?: () => void;
}> = ({ place, onAdd, onClick }) => (
  <div
    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer w-36 shrink-0"
    onClick={onClick}
  >
    <div className="relative h-24 overflow-hidden">
      <Image src={place.image} alt={place.name} fill sizes="144px" className="object-cover" />
      <button
        onClick={(e) => { e.stopPropagation(); onAdd(); }}
        className="absolute bottom-1.5 right-1.5 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow text-primary-500 active:scale-90 transition-transform"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
    <div className="p-2.5">
      <div className="text-[10px] font-bold text-primary-600 mb-0.5">{place.category}</div>
      <h3 className="font-bold text-xs text-gray-900 line-clamp-1">{place.name}</h3>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-gray-400 truncate">{place.location}</span>
        <div className="flex items-center gap-0.5 text-[10px] text-gray-400 shrink-0">
          <Heart size={9} /> {(place.likes ?? 0).toLocaleString()}
        </div>
      </div>
    </div>
  </div>
);

const PlaceCardGrid: React.FC<{
  place: BestPlace;
  onAdd: () => void;
  onClick?: () => void;
}> = ({ place, onAdd, onClick }) => (
  <div
    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer active:scale-[0.98] transition-transform"
    onClick={onClick}
  >
    <div className="relative h-32 overflow-hidden">
      <Image
        src={place.image}
        alt={place.name}
        fill
        sizes="(max-width: 480px) 50vw, 240px"
        className="object-cover transition-transform group-hover:scale-110 duration-500"
      />
      <button
        onClick={(e) => { e.stopPropagation(); onAdd(); }}
        className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full shadow-md text-primary-500 active:scale-90 transition-transform"
      >
        <Plus size={16} strokeWidth={3} />
      </button>
    </div>
    <div className="p-3">
      <div className="text-[10px] font-bold text-primary-600 mb-0.5">{place.category}</div>
      <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1">{place.name}</h3>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{place.location}</span>
        <div className="flex items-center gap-0.5 text-xs text-gray-400">
          <Heart size={10} /> {(place.likes ?? 0).toLocaleString()}
        </div>
      </div>
    </div>
  </div>
);
