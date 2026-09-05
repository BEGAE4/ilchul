'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/shared/ui/SafeImage';
import {
  Heart,
  MapPin,
  ArrowRight,
  Plus,
  Flame,
  TrendingUp,
  Navigation,
} from 'lucide-react';
import PageLayout from '@/shared/ui/PageLayout';
import { getNavItems } from '@/shared/lib/constants/navItems';
import { ScrollCarousel } from '@/shared/ui/ScrollCarousel';
import { HomePageSkeleton, Skeleton, SkeletonCard } from '@/shared/ui/Skeleton';
import { PlaceAddSheet } from '@/shared/ui/PlaceAddSheet';
import { useGeolocation } from '@/features/main/hooks/useGeolocation';
import { useNearbyPopularPlaces } from '@/features/main/hooks/useNearbyPopularPlaces';
import { useNearbyPopularPlans } from '@/features/main/hooks/useNearbyPopularPlans';
import { useNationwidePopularPlaces } from '@/features/main/hooks/useNationwidePopularPlaces';
import { useNationwidePopularPlans } from '@/features/main/hooks/useNationwidePopularPlans';
import { getSafeImageSrc } from '@/features/main/utils/image';
import type { PopularPlace } from '@/features/main/types';
import type { BestPlace } from '@/shared/types';

// 위치 미허용 시 서울 기본 좌표
const DEFAULT_COORDS = { lat: 37.5665, lng: 126.978 };
const INTRO_SEEN_KEY = 'ilchul_intro_seen';

// 섹션 단위 API 실패 표시 + 재시도 (QA A #7 — 실패가 "데이터 없음"처럼 보이던 문제)
const SectionError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
    <p className="text-xs text-gray-500">목록을 불러오지 못했어요</p>
    <button
      type="button"
      onClick={onRetry}
      className="px-3 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 rounded-full active:scale-95 transition-transform"
    >
      다시 시도
    </button>
  </div>
);

const SectionEmpty = ({ message }: { message: string }) => (
  <p className="py-6 text-center text-xs text-gray-400">{message}</p>
);

export default function Home() {
  const router = useRouter();
  const navItems = getNavItems('home', path => router.push(path));
  const [selectedPlace, setSelectedPlace] = useState<PopularPlace | null>(null);

  // 인트로 분기가 끝나기 전에는 API·위치 권한 요청을 시작하지 않는다.
  // 첫 방문 시 홈이 먼저 마운트되어 API 5건 + 권한 팝업이 인트로보다 먼저 뜨던 문제 (QA A #5).
  const [introChecked, setIntroChecked] = useState(false);

  // 위치 정보 — 권한 응답을 기다리지 않고 기본 좌표로 먼저 조회하고,
  // 실제 좌표가 확정되면 baseParams 변경으로 주변 섹션이 자동 재조회된다.
  // 단, 실제 좌표 주변에 등록된 장소가 없으면(빈 응답) 기본 좌표로 되돌린다.
  const geo = useGeolocation(introChecked);
  const [fallbackToDefault, setFallbackToDefault] = useState(false);
  const realCoords = fallbackToDefault ? null : geo.coords;
  const effectiveLat = realCoords?.lat ?? DEFAULT_COORDS.lat;
  const effectiveLng = realCoords?.lng ?? DEFAULT_COORDS.lng;

  // API 훅
  const nearbyPlaces = useNearbyPopularPlaces({
    lat: effectiveLat,
    lng: effectiveLng,
    limit: 5,
    enabled: introChecked,
  });
  const nearbyPlans = useNearbyPopularPlans({
    lat: effectiveLat,
    lng: effectiveLng,
    limit: 5,
    enabled: introChecked,
  });
  const nationwidePlaces = useNationwidePopularPlaces({
    limit: 6,
    enabled: introChecked,
  });
  const nationwidePlans = useNationwidePopularPlans({
    limit: 3,
    enabled: introChecked,
  });

  // 실제 좌표 기준 주변 장소가 비어 있으면 기본 좌표(서울)로 폴백
  // API 실패로 비어 있는 경우는 폴백 대상이 아니다(에러 UI 로 표시).
  useEffect(() => {
    if (
      realCoords &&
      !nearbyPlaces.isLoading &&
      !nearbyPlaces.error &&
      nearbyPlaces.items.length === 0
    ) {
      setFallbackToDefault(true);
    }
  }, [
    realCoords,
    nearbyPlaces.isLoading,
    nearbyPlaces.error,
    nearbyPlaces.items.length,
  ]);

  // 인트로 리다이렉트 — replace 로 보내 인트로에서 뒤로가기 시 홈이 다시 인트로로
  // 보내는 루프를 막는다 (QA A #3). 본 적이 있으면 그때부터 API·위치 요청을 시작한다.
  useEffect(() => {
    let hasSeenIntro: string | null = null;
    try {
      hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY);
    } catch {
      hasSeenIntro = 'true';
    }
    if (hasSeenIntro !== 'true') {
      router.replace('/intro');
      return;
    }
    setIntroChecked(true);
  }, [router]);

  const isInitialLoading =
    !introChecked ||
    (nationwidePlaces.isLoading && nationwidePlaces.items.length === 0) ||
    (nationwidePlans.isLoading && nationwidePlans.items.length === 0);

  // 위치를 쓸 수 없거나(거부·타임아웃·미지원) 주변에 데이터가 없어 기본 좌표로 보여줄 때 안내 (QA A #8)
  const locationNotice = fallbackToDefault
    ? '내 주변에 등록된 장소가 없어 서울 기준으로 보여드려요'
    : geo.status === 'denied' || geo.status === 'unsupported'
      ? '위치 정보를 사용할 수 없어 서울 기준으로 보여드려요'
      : null;

  // 주변 섹션은 좌표 확정 여부와 무관하게 자리(스켈레톤)를 유지한다
  const nearbyPlacesLoading =
    nearbyPlaces.isLoading && nearbyPlaces.items.length === 0;
  const nearbyPlansLoading =
    nearbyPlans.isLoading && nearbyPlans.items.length === 0;

  const handleCourseClick = (id: string) => router.push(`/course/${id}`);
  const handlePlaceNavigate = (id: string) => router.push(`/place/${id}`);

  if (isInitialLoading) {
    return (
      <PageLayout bottomNavItems={navItems}>
        <HomePageSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout bottomNavItems={navItems}>
      <div className="bg-gray-50 flex-1 pb-10">
        {/* ───── 섹션 1: 비주얼 슬라이드 배너 ───── */}
        <div className="relative mb-2">
          {nearbyPlacesLoading ? (
            <Skeleton variant="image" height={320} />
          ) : nearbyPlaces.error && nearbyPlaces.items.length === 0 ? (
            <div className="h-80 w-full bg-gray-100 flex items-center justify-center">
              <SectionError onRetry={nearbyPlaces.retry} />
            </div>
          ) : (
            <ScrollCarousel
              autoPlay
              autoPlayInterval={3500}
              showDots
              dotsPosition="overlay"
            >
              {nearbyPlaces.items.slice(0, 3).map(place => (
                <div
                  key={place.id}
                  className="relative h-80 w-full cursor-pointer"
                  onClick={() => handlePlaceNavigate(place.id)}
                >
                  <Image
                    src={getSafeImageSrc(place.image)}
                    alt={place.name}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-12 left-5 right-5 text-white">
                    <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-bold bg-primary-500 rounded text-white">
                      {place.category}
                    </span>
                    <h2 className="text-2xl font-bold leading-tight mb-1">
                      {place.name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-sm opacity-90">
                      <MapPin size={12} />
                      <span>{place.location}</span>
                      <span className="mx-1 opacity-50">|</span>
                      <Heart size={12} className="fill-white" />
                      <span>{(place.likes ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollCarousel>
          )}
        </div>

        {/* ───── 주변 인기 장소 ───── */}
        <div className="mb-8">
          <div className="px-5 pt-5 pb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-primary-500" />
              <h2 className="text-lg font-bold text-gray-900">
                주변 인기 장소
              </h2>
            </div>
            <button
              className="text-xs text-gray-400 flex items-center gap-0.5"
              onClick={() => router.push('/place/popular')}
            >
              더보기 <ArrowRight size={12} />
            </button>
          </div>
          {locationNotice && (
            <p className="px-5 pb-3 -mt-2 text-xs text-gray-400">{locationNotice}</p>
          )}
          <div className="px-4">
            {nearbyPlacesLoading ? (
              <div className="flex gap-2.5 overflow-hidden">
                {[1, 2, 3].map(i => (
                  <div key={i} className="shrink-0 w-36">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : nearbyPlaces.error && nearbyPlaces.items.length === 0 ? (
              <SectionError onRetry={nearbyPlaces.retry} />
            ) : nearbyPlaces.items.length === 0 ? (
              <SectionEmpty message="주변에 등록된 장소가 아직 없어요" />
            ) : (
              <ScrollCarousel slidesToShow={2.4} gap={10}>
                {nearbyPlaces.items.map((place, idx) => (
                  <div
                    key={place.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => handlePlaceNavigate(place.id)}
                  >
                    <div className="relative h-28 overflow-hidden">
                      <Image
                        src={getSafeImageSrc(place.image)}
                        alt={place.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-bold">
                        {idx + 1}
                      </div>
                      <button
                        className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow text-primary-500 active:scale-90 transition-transform"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedPlace(place);
                        }}
                        aria-label="플랜에 추가"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                    <div className="p-2.5">
                      <div className="text-[10px] font-bold text-primary-600 mb-0.5">
                        {place.category}
                      </div>
                      <h3 className="font-bold text-xs text-gray-900 line-clamp-1">
                        {place.name}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400">
                          {place.location}
                        </span>
                        <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <Heart size={9} />{' '}
                          {(place.likes ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollCarousel>
            )}
          </div>
        </div>

        {/* ───── 실시간 베스트 플랜 ───── */}
        <div className="mb-8">
          <div className="px-5 mb-3 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-accent-500" />
                <h2 className="text-lg font-bold text-gray-900">
                  실시간 베스트 플랜
                </h2>
              </div>
              <p className="text-xs text-gray-500">
                지금 내 주변에서 가장 핫한 플랜
              </p>
            </div>
            <button
              className="text-xs text-gray-400 flex items-center gap-0.5"
              onClick={() => router.push('/plan/popular')}
            >
              더보기 <ArrowRight size={12} />
            </button>
          </div>
          <div className="px-4">
            {nearbyPlansLoading ? (
              <SkeletonCard />
            ) : nearbyPlans.error && nearbyPlans.items.length === 0 ? (
              <SectionError onRetry={nearbyPlans.retry} />
            ) : nearbyPlans.items.length === 0 ? (
              <SectionEmpty message="주변에 등록된 플랜이 아직 없어요" />
            ) : (
              <ScrollCarousel slidesToShow={1.15} gap={12}>
                {nearbyPlans.items.slice(0, 5).map((plan, index) => (
                  <div
                    key={String(plan.id)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => handleCourseClick(String(plan.id))}
                  >
                    <div className="relative h-40">
                      <Image
                        src={getSafeImageSrc(plan.thumbnail)}
                        alt={plan.title}
                        fill
                        sizes="320px"
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg text-white font-bold italic border border-white/20">
                        {index + 1}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1.5">
                        {plan.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                        {plan.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={10} />
                          <span>{plan.location}</span>
                          <span className="w-0.5 h-2.5 bg-gray-200 mx-1" />
                          <span>{plan.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart
                            size={10}
                            className="text-red-400 fill-red-400"
                          />
                          <span className="text-xs font-bold text-gray-600">
                            {plan.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollCarousel>
            )}
          </div>
        </div>

        {/* ───── 전국 인기 장소 ───── */}
        <div className="px-5 mb-8">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-primary-500" />
                <h2 className="text-lg font-bold text-gray-900">
                  전국 인기 장소
                </h2>
              </div>
              <p className="text-xs text-gray-500">
                전국에서 가장 사랑받는 여행지
              </p>
            </div>
            <button
              className="text-xs text-gray-400 flex items-center gap-0.5"
              onClick={() => router.push('/place/popular/nationwide')}
            >
              더보기 <ArrowRight size={12} />
            </button>
          </div>
          {nationwidePlaces.error && nationwidePlaces.items.length === 0 && (
            <SectionError onRetry={nationwidePlaces.retry} />
          )}
          <div className="grid grid-cols-2 gap-3">
            {nationwidePlaces.items.map((place, idx) => (
              <div
                key={place.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => handlePlaceNavigate(place.id)}
              >
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={getSafeImageSrc(place.image)}
                    alt={place.name}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                  <div className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-bold">
                    {idx + 1}
                  </div>
                  <button
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md text-primary-500 active:scale-90 transition-transform"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedPlace(place);
                    }}
                    aria-label="플랜에 추가"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-primary-600 mb-0.5">
                    {place.category}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1">
                    {place.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {place.location}
                    </span>
                    <div className="flex items-center gap-0.5 text-xs text-gray-400">
                      <Heart size={10} /> {(place.likes ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ───── 전국 인기 플랜 ───── */}
        <div className="mb-8">
          <div className="px-5 mb-3 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-primary-500" />
                <h2 className="text-lg font-bold text-gray-900">
                  전국 인기 플랜
                </h2>
              </div>
              <p className="text-xs text-gray-500">
                전국 여행자들이 선택한 베스트 플랜
              </p>
            </div>
            <button
              className="text-xs text-gray-400 flex items-center gap-0.5"
              onClick={() => router.push('/plan/popular/nationwide')}
            >
              더보기 <ArrowRight size={12} />
            </button>
          </div>
          <div className="px-5 space-y-3">
            {nationwidePlans.error && nationwidePlans.items.length === 0 && (
              <SectionError onRetry={nationwidePlans.retry} />
            )}
            {nationwidePlans.items.map((plan, index) => (
              <div
                key={String(plan.id)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-28 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => handleCourseClick(String(plan.id))}
              >
                <div className="relative w-28 shrink-0">
                  <Image
                    src={getSafeImageSrc(plan.thumbnail)}
                    alt={plan.title}
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
                      {plan.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {plan.description}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <MapPin size={9} />
                        <span>{plan.location}</span>
                        <span className="w-0.5 h-2 bg-gray-200 mx-0.5" />
                        <span>{plan.duration}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Heart size={9} className="text-red-400 fill-red-400" />
                        <span className="text-[10px] font-bold text-gray-500">
                          {plan.likes}
                        </span>
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
            <button
              onClick={() => router.push('/profile/settings')}
              className="text-xs hover:text-gray-600"
            >
              이용약관
            </button>
            <button
              onClick={() => router.push('/profile/settings')}
              className="text-xs font-bold hover:text-gray-600"
            >
              개인정보처리방침
            </button>
            <button
              onClick={() => router.push('/profile/settings')}
              className="text-xs hover:text-gray-600"
            >
              고객센터
            </button>
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
          place={selectedPlace as BestPlace}
        />
      </div>
    </PageLayout>
  );
}
