'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  Heart,
  MapPin,
  Plus,
  Route,
  Search,
  BadgeCheck,
} from 'lucide-react';
import Image from 'next/image';
import { MOCK_COURSES, NATIONWIDE_COURSES, BEST_PLACES, NEARBY_POPULAR_PLACES, NATIONWIDE_PLACES } from '@/shared/data/mockData';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';
import type { Course, BestPlace } from '@/shared/types';
import { ScrollCarousel } from '@/shared/ui/ScrollCarousel';
import { PlaceAddSheet } from '@/shared/ui/PlaceAddSheet';
import { SearchResultsSkeleton } from '@/shared/ui/Skeleton';

type ViewTab = '전체' | '코스' | '장소';
const VIEW_TABS: ViewTab[] = ['전체', '코스', '장소'];

const ALL_COURSES = [...MOCK_COURSES, ...NATIONWIDE_COURSES];
const ALL_PLACES = [...BEST_PLACES, ...NEARBY_POPULAR_PLACES, ...NATIONWIDE_PLACES];

export const SearchResultsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const initialTab = (searchParams.get('tab') as ViewTab) || '전체';

  const [activeViewTab, setActiveViewTab] = useState<ViewTab>(initialTab);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<BestPlace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setIsLoading(false);
  }, [query]);

  const { toggleBookmark, toggleLike, isBookmarked, isLiked } = useCourseStore();

  const filteredCourses = useMemo(() => {
    let list = ALL_COURSES.filter(
      (c) =>
        query === '' ||
        c.title.includes(query) ||
        c.location.includes(query) ||
        c.tags.some((t) => t.includes(query)) ||
        c.description.includes(query)
    );

    if (verifiedOnly) {
      list = list.filter((c) => c.isVerified);
    }

    return list.sort((a, b) => b.likes - a.likes);
  }, [query, verifiedOnly]);

  const filteredPlaces = useMemo(() => {
    const unique = ALL_PLACES.filter(
      (p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx
    );
    return unique
      .filter(
        (p) =>
          query === '' ||
          p.name.includes(query) ||
          p.location.includes(query) ||
          p.category.includes(query)
      )
      .sort((a, b) => b.likes - a.likes);
  }, [query]);

  const totalCourses = filteredCourses.length;
  const totalPlaces = filteredPlaces.length;

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
              tab === '코스'
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
                    activeViewTab === tab ? 'text-sky-500' : 'text-gray-300'
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
      <div className="bg-gray-50 min-h-screen">
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
                    <span className="ml-1.5 text-sky-500">{filteredPlaces.length}</span>
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

            {/* 코스 섹션 — 수직 리스트 */}
            {filteredCourses.length > 0 && (
              <div className="pt-4 px-4">
                <div className="px-1 mb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-900">
                    코스
                    <span className="ml-1.5 text-sky-500">{filteredCourses.length}</span>
                  </h3>
                  {filteredCourses.length > 3 && (
                    <button
                      onClick={() => setActiveViewTab('코스')}
                      className="text-xs text-gray-400 font-bold flex items-center gap-0.5"
                    >
                      전체보기 <ChevronDown size={12} className="rotate-[-90deg]" />
                    </button>
                  )}
                </div>
                {filteredCourses.slice(0, 4).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isLiked={isLiked(course.id)}
                    isBookmarked={isBookmarked(course.id)}
                    onLike={() => toggleLike(course.id)}
                    onBookmark={() => toggleBookmark(course.id)}
                    onClick={() => router.push(`/course/${course.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 코스 탭 */}
        {activeViewTab === '코스' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 ml-1">
              <p className="text-sm text-gray-500">
                총 <span className="font-bold text-sky-500">{filteredCourses.length}</span>개의 코스
              </p>
              <button
                onClick={() => setVerifiedOnly((prev) => !prev)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                  verifiedOnly
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all ${
                    verifiedOnly ? 'bg-blue-500 text-white' : 'border border-gray-300 bg-white'
                  }`}
                >
                  {verifiedOnly && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <BadgeCheck size={13} />
                인증된 코스
              </button>
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <Route size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">
                  {verifiedOnly ? '인증된 코스가 없어요' : '검색 결과가 없어요'}
                </p>
                {verifiedOnly && (
                  <button
                    onClick={() => setVerifiedOnly(false)}
                    className="mt-3 text-xs font-bold text-sky-500 underline"
                  >
                    필터 해제
                  </button>
                )}
              </div>
            )}

            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isLiked={isLiked(course.id)}
                isBookmarked={isBookmarked(course.id)}
                onLike={() => toggleLike(course.id)}
                onBookmark={() => toggleBookmark(course.id)}
                onClick={() => router.push(`/course/${course.id}`)}
              />
            ))}
          </div>
        )}

        {/* 장소 탭 */}
        {activeViewTab === '장소' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 ml-1">
              <p className="text-sm text-gray-500">
                총 <span className="font-bold text-sky-500">{filteredPlaces.length}</span>개의 장소
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
  course: Course;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onClick: () => void;
}

function CourseCard({ course, isLiked, isBookmarked, onLike, onBookmark, onClick }: CourseCardProps) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-3 cursor-pointer active:scale-[0.99] transition-transform"
      onClick={onClick}
    >
      <div className="relative h-40">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
        />
        {course.isVerified && (
          <span className="absolute top-2.5 left-2.5 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            인증
          </span>
        )}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center"
          >
            <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'white'} />
          </button>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-gray-900 text-sm mb-1">{course.title}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{course.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin size={10} />
            <span>{course.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-0.5">
              <Heart size={10} className="text-red-400" />
              {isLiked ? course.likes + 1 : course.likes}
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
        className="absolute bottom-1.5 right-1.5 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow text-sky-500 active:scale-90 transition-transform"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
    <div className="p-2.5">
      <div className="text-[10px] font-bold text-sky-600 mb-0.5">{place.category}</div>
      <h3 className="font-bold text-xs text-gray-900 line-clamp-1">{place.name}</h3>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-gray-400 truncate">{place.location}</span>
        <div className="flex items-center gap-0.5 text-[10px] text-gray-400 shrink-0">
          <Heart size={9} /> {place.likes.toLocaleString()}
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
        className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full shadow-md text-sky-500 active:scale-90 transition-transform"
      >
        <Plus size={16} strokeWidth={3} />
      </button>
    </div>
    <div className="p-3">
      <div className="text-[10px] font-bold text-sky-600 mb-0.5">{place.category}</div>
      <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1">{place.name}</h3>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{place.location}</span>
        <div className="flex items-center gap-0.5 text-xs text-gray-400">
          <Heart size={10} /> {place.likes.toLocaleString()}
        </div>
      </div>
    </div>
  </div>
);
