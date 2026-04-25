'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, MapPin, ArrowRight, Plus, Flame, TrendingUp, Navigation } from 'lucide-react';
import PageLayout from '@/shared/ui/PageLayout';
import { getNavItems } from '@/shared/lib/constants/navItems';
import {
  NEARBY_POPULAR_PLACES,
  NATIONWIDE_PLACES,
  NATIONWIDE_COURSES,
} from '@/shared/data/mockData';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';
import { ScrollCarousel } from '@/shared/ui/ScrollCarousel';
import { HomePageSkeleton } from '@/shared/ui/Skeleton';
import { PlaceAddSheet } from '@/shared/ui/PlaceAddSheet';
import type { BestPlace } from '@/shared/types';

const INTRO_SEEN_KEY = 'ilchul_intro_seen';

export default function Home() {
  const router = useRouter();
  const navItems = getNavItems('home', (path) => router.push(path));
  const { courses } = useCourseStore();
  const [selectedPlace, setSelectedPlace] = useState<BestPlace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY);
    if (hasSeenIntro !== 'true') {
      router.push('/intro');
    }
  }, [router]);

  useEffect(() => {
    // Mock 데이터 사용 시 즉시 로드, API 연동 시 실제 fetch 완료 기준으로 전환
    setIsLoading(false);
  }, []);

  const handleCourseClick = (id: string) => router.push(`/course/${id}`);
  const handlePlaceNavigate = (id: string) => router.push(`/place/${id}`);

  const handlePlaceAdd = (placeId: string, list: BestPlace[]) => {
    const place = list.find((p) => p.id === placeId);
    if (place) setSelectedPlace(place);
  };

  if (isLoading) {
    return (
      <PageLayout bottomNavItems={navItems}>
        <HomePageSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout bottomNavItems={navItems}>
      <div className="bg-gray-50 min-h-full pb-10">

        {/* ───── 섹션 1: 비주얼 슬라이드 배너 ───── */}
        <div className="relative mb-2">
          <ScrollCarousel autoPlay autoPlayInterval={3500} showDots dotsPosition="overlay">
            {NEARBY_POPULAR_PLACES.slice(0, 3).map((place) => (
              <div
                key={place.id}
                className="relative h-80 w-full cursor-pointer"
                onClick={() => handlePlaceNavigate(place.id)}
              >
                <Image
                  src={place.image}
                  alt={place.name}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-12 left-5 right-5 text-white">
                  <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-bold bg-sky-500 rounded text-white">
                    {place.category}
                  </span>
                  <h2 className="text-2xl font-bold leading-tight mb-1">{place.name}</h2>
                  <div className="flex items-center gap-1.5 text-sm opacity-90">
                    <MapPin size={12} />
                    <span>{place.location}</span>
                    <span className="mx-1 opacity-50">|</span>
                    <Heart size={12} className="fill-white" />
                    <span>{place.likes.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </ScrollCarousel>
        </div>

        {/* ───── 주변 인기 장소 ───── */}
        <div className="mb-8">
          <div className="px-5 pt-5 pb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-sky-500" />
              <h2 className="text-lg font-bold text-gray-900">주변 인기 장소</h2>
            </div>
            <button
              className="text-xs text-gray-400 flex items-center gap-0.5"
              onClick={() => router.push('/search')}
            >
              더보기 <ArrowRight size={12} />
            </button>
          </div>
          <div className="px-4">
            <ScrollCarousel slidesToShow={2.4} gap={10}>
              {NEARBY_POPULAR_PLACES.map((place, idx) => (
                <div
                  key={place.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => handlePlaceNavigate(place.id)}
                >
                  <div className="relative h-28 overflow-hidden">
                    <Image
                      src={place.image}
                      alt={place.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-bold">
                      {idx + 1}
                    </div>
                    <button
                      className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow text-sky-500 active:scale-90 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaceAdd(place.id, NEARBY_POPULAR_PLACES);
                      }}
                      aria-label="코스에 추가"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] font-bold text-sky-600 mb-0.5">{place.category}</div>
                    <h3 className="font-bold text-xs text-gray-900 line-clamp-1">{place.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-400">{place.location}</span>
                      <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
                        <Heart size={9} /> {place.likes.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollCarousel>
          </div>
        </div>

        {/* ───── 실시간 베스트 코스 ───── */}
        <div className="mb-8">
          <div className="px-5 mb-3 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-orange-500" />
                <h2 className="text-lg font-bold text-gray-900">실시간 베스트 코스</h2>
              </div>
              <p className="text-xs text-gray-500">지금 내 주변에서 가장 핫한 코스</p>
            </div>
            <button
              className="text-xs text-gray-400 flex items-center gap-0.5"
              onClick={() => router.push('/search')}
            >
              더보기 <ArrowRight size={12} />
            </button>
          </div>
          <div className="px-4">
            <ScrollCarousel slidesToShow={1.15} gap={12}>
              {courses.slice(0, 5).map((course, index) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="relative h-40">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg text-white font-bold italic border border-white/20">
                      {index + 1}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 flex gap-1.5">
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
                  <div className="p-3.5">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1.5">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={10} />
                        <span>{course.location}</span>
                        <span className="w-0.5 h-2.5 bg-gray-200 mx-1" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={10} className="text-red-400 fill-red-400" />
                        <span className="text-xs font-bold text-gray-600">{course.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollCarousel>
          </div>
        </div>

        {/* ───── 전국 인기 장소 ───── */}
        <div className="px-5 mb-8">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-emerald-500" />
                <h2 className="text-lg font-bold text-gray-900">전국 인기 장소</h2>
              </div>
              <p className="text-xs text-gray-500">전국에서 가장 사랑받는 여행지</p>
            </div>
            <button
              className="text-xs text-gray-400 flex items-center gap-0.5"
              onClick={() => router.push('/search')}
            >
              더보기 <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {NATIONWIDE_PLACES.map((place, idx) => (
              <div
                key={place.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => handlePlaceNavigate(place.id)}
              >
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={place.image}
                    alt={place.name}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                  <div className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-bold">
                    {idx + 1}
                  </div>
                  <button
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md text-sky-500 active:scale-90 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaceAdd(place.id, NATIONWIDE_PLACES);
                    }}
                    aria-label="코스에 추가"
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
            ))}
          </div>
        </div>

        {/* ───── 전국 인기 코스 ───── */}
        <div className="mb-8">
          <div className="px-5 mb-3 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-violet-500" />
                <h2 className="text-lg font-bold text-gray-900">전국 인기 코스</h2>
              </div>
              <p className="text-xs text-gray-500">전국 여행자들이 선택한 베스트 코스</p>
            </div>
            <button
              className="text-xs text-gray-400 flex items-center gap-0.5"
              onClick={() => router.push('/search')}
            >
              더보기 <ArrowRight size={12} />
            </button>
          </div>
          <div className="px-5 space-y-3">
            {NATIONWIDE_COURSES.map((course, index) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-28 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="relative w-28 shrink-0">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded text-white text-xs font-bold italic border border-white/20">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{course.description}</p>
                  </div>
                  <div>
                    <div className="flex gap-1.5 mb-1.5">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-sky-600 bg-sky-50 rounded px-1.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <MapPin size={9} />
                        <span>{course.location}</span>
                        <span className="w-0.5 h-2 bg-gray-200 mx-0.5" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Heart size={9} className="text-red-400 fill-red-400" />
                        <span className="text-[10px] font-bold text-gray-500">{course.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ───── Footer ───── */}
        <footer className="bg-gray-100 border-t border-gray-200 py-10 px-5 text-center">
          <div className="flex justify-center gap-4 mb-6 text-gray-400">
            <button onClick={() => router.push('/profile/settings')} className="text-xs hover:text-gray-600">이용약관</button>
            <button onClick={() => router.push('/profile/settings')} className="text-xs font-bold hover:text-gray-600">개인정보처리방침</button>
            <button onClick={() => router.push('/profile/settings')} className="text-xs hover:text-gray-600">고객센터</button>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed mb-4">
            (주)일출 | 대표: 일출
            <br />
            서울시 강남구 테헤란로 123
            <br />
            Copyright © 2024 일출. All rights reserved.
          </p>
        </footer>

        {/* PlaceAddSheet */}
        <PlaceAddSheet
          open={!!selectedPlace}
          onClose={() => setSelectedPlace(null)}
          place={selectedPlace}
        />
      </div>
    </PageLayout>
  );
}
