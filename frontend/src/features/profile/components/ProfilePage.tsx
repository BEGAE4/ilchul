'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/shared/ui/SafeImage';
import { Settings, Plus, Bookmark, MapPin, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { useRequireAuth } from '@/features/authentication/hooks';
import {
  fetchMyPlans,
  fetchScrappedPlans,
  fetchMyPageProfile,
  fetchMyPageSummary,
  setMyPlanVisibility,
} from '@/features/my-page/api';
import type { MyPlan, ScrappedPlan } from '@/features/my-page/types/plan.types';
import type { MyPageSummary } from '@/features/my-page/types/summary.types';

type MainTab = 'plans' | 'bookmarks';

export const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const { user, email, updateProfile } = useUserStore();
  const [mainTab, setMainTab] = useState<MainTab>('plans');
  const [plansLoading, setPlansLoading] = useState(true);
  const [plans, setPlans] = useState<MyPlan[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [planVisibility, setPlanVisibility] = useState<Record<number, boolean>>(
    {}
  );
  const [planVisibilityLoading, setPlanVisibilityLoading] = useState<
    Record<number, boolean>
  >({});

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<MyPageSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [scrappedLoading, setScrappedLoading] = useState(true);
  const [scrappedPlans, setScrappedPlans] = useState<ScrappedPlan[]>([]);
  const [scrappedError, setScrappedError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError(null);
        const data = await fetchMyPlans();
        if (isMounted) {
          setPlans(data);
          setPlanVisibility(prev => {
            const next = { ...prev };
            data.forEach((plan) => {
              if (typeof plan.isPlanVisible === 'boolean') {
                next[plan.planId] = plan.isPlanVisible;
              }
            });
            return next;
          });
        }
      } catch (err) {
        console.error('플랜 목록 로드 실패:', err);
        if (isMounted) setPlansError('플랜 목록을 불러오지 못했어요.');
      } finally {
        if (isMounted) setPlansLoading(false);
      }
    };

    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const data = await fetchMyPageSummary();
        if (isMounted) setSummary(data);
      } catch (err) {
        console.error('마이페이지 요약 정보 로드 실패:', err);
        if (isMounted) setSummaryError('마이페이지 요약 정보를 불러오지 못했어요.');
      } finally {
        if (isMounted) setSummaryLoading(false);
      }
    };

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadScrappedPlans = async () => {
      try {
        setScrappedLoading(true);
        setScrappedError(null);
        const data = await fetchScrappedPlans();
        if (isMounted) setScrappedPlans(data);
      } catch (err) {
        console.error('저장한 플랜 로드 실패:', err);
        if (isMounted) setScrappedError('저장한 플랜을 불러오지 못했어요.');
      } finally {
        if (isMounted) setScrappedLoading(false);
      }
    };

    loadScrappedPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await fetchMyPageProfile();
        if (isMounted) {
          updateProfile({
            name: data.userNickname,
            avatar: data.userImg,
            title: data.userIntro,
            bio: data.userIntro,
          });
        }
      } catch (err) {
        console.error('프로필 정보 로드 실패:', err);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [updateProfile]);

  const STATS: { label: string; value: number | string; color: string }[] = [
    {
      label: '공개 플랜',
      value: summaryLoading
        ? '...'
        : summaryError
        ? '—'
        : summary?.publicPlanCount ?? 0,
      color: 'text-primary-500',
    },
    {
      label: '인증 플랜',
      value: summaryLoading
        ? '...'
        : summaryError
        ? '—'
        : summary?.verifyPlanCount ?? 0,
      color: 'text-primary-500',
    },
    {
      label: '받은 저장',
      value: summaryLoading
        ? '...'
        : summaryError
        ? '—'
        : summary?.scrappedByOthersCount ?? 0,
      color: 'text-primary-500',
    },
    {
      label: '저장한 플랜',
      value: summaryLoading
        ? '...'
        : summaryError
        ? '—'
        : summary?.savedCourseCount ?? 0,
      color: 'text-primary-500',
    },
  ];

  const formatIsoDate = (iso: string | null) => {
    if (!iso) return '생성일 미정';
    // 서버 날짜는 'yyyy-MM-dd HH:mm' 형식 — Safari/iOS 호환을 위해 ISO(T)로 정규화
    const d = new Date(iso.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 여행 기간 표시 (시작~종료). 시작만 있으면 시작일만, 없으면 '일정 미정'
  const formatTripPeriod = (start: string | null, end: string | null) => {
    if (!start) return '일정 미정';
    const startText = formatIsoDate(start);
    if (!end) return startText;
    const endText = formatIsoDate(end);
    return startText === endText ? startText : `${startText} ~ ${endText}`;
  };

  // 소요 시간(분) → 'N시간 M분'
  const formatRequiredTime = (minutes: number) => {
    if (!minutes || minutes <= 0) return '소요 시간 미정';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${m}분`;
  };

  const handleTogglePlanVisibility = async (planId: number) => {
    const current = planVisibility[planId];
    const next = current === undefined ? true : !current;

    try {
      setPlanVisibilityLoading(prev => ({ ...prev, [planId]: true }));
      await setMyPlanVisibility(planId);
      setPlanVisibility(prev => ({ ...prev, [planId]: next }));
      toast.success(next ? '플랜을 공개했어요.' : '플랜을 비공개로 전환했어요.');
    } catch (err) {
      console.error('플랜 공개여부 설정 실패:', err);
      toast.error('플랜 공개 여부 설정에 실패했어요.');
    } finally {
      setPlanVisibilityLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  // 이전에는 zustand 목데이터(useCourseStore.myCourses) 탭이 같은 '내 플랜' 이름으로 하나 더 있었다.
  // 서버 플랜 탭이 생긴 뒤에도 남아 가짜 플랜 2건이 실제 사용자에게 노출되고 있었다.
  const TABS: { key: MainTab; label: string; count: number }[] = [
    { key: 'plans', label: '내 플랜', count: plans.length },
    { key: 'bookmarks', label: '저장 플랜', count: scrappedPlans.length },
  ];

  // 로그인 확인 전 / 미로그인(리다이렉트 대기) 시 보호 콘텐츠 노출 방지
  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-32 text-sm text-gray-400">
        로그인 확인 중...
      </div>
    );
  }

  return (
    <div className="pb-24 bg-gray-50 flex-1">
      {/* ─── 프로필 헤더 ─── */}
      <div className="bg-white p-5 pb-0 border-b border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
          <button
            onClick={() => router.push('/profile/settings')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>

        {/* 아바타 + 이름 */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-gray-100 flex items-center justify-center">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt="프로필"
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <User size={28} className="text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900">
              {user.name || '여행자'}
            </div>
            {email && (
              <div className="text-xs text-gray-400 mt-0.5">{email}</div>
            )}
            {user.bio && (
              <p className="text-xs text-gray-400 mt-1">{user.bio}</p>
            )}
          </div>
        </div>

        {/* ─── 통계 ─── */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-center bg-gray-50 rounded-xl p-3"
            >
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ─── 메인 탭 ─── */}
        <div className="flex gap-0 border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              className={`flex-1 pb-3 text-sm font-bold transition-all relative text-center ${
                mainTab === tab.key ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                mainTab === tab.key ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab.count}
              </span>
              {mainTab === tab.key && (
                <motion.div
                  layoutId="mainTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 탭 콘텐츠 ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mainTab}
          initial={{ opacity: 0, x: mainTab === 'plans' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mainTab === 'plans' ? 20 : -20 }}
          transition={{ duration: 0.2 }}
        >

          {mainTab === 'bookmarks' && (
            <div className="p-4">
              {scrappedLoading && (
                <div className="py-10 text-center text-gray-500">저장한 플랜을 불러오는 중...</div>
              )}

              {!scrappedLoading && scrappedError && (
                <div className="py-10 text-center text-red-500">{scrappedError}</div>
              )}

              {!scrappedLoading && !scrappedError && scrappedPlans.length > 0 && (
                <div className="space-y-4">
                  {scrappedPlans.map((plan) => (
                    <div
                      key={plan.planId}
                      onClick={() => router.push(`/course/${plan.planId}`)}
                      className="relative rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer"
                    >
                      <div className="relative h-36">
                        <img
                          src={plan.planImages?.[0] ?? '/images/course-plan.png'}
                          alt={plan.planTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow">
                          <Bookmark size={12} fill="var(--color-primary-500)" className="text-primary-500" />
                          <span className="text-[10px] font-bold text-primary-500">저장됨</span>
                        </div>
                        {!plan.isPlanVisible && (
                          <span className="absolute top-2.5 left-2.5 text-[10px] text-white bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5">
                            비공개
                          </span>
                        )}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-bold text-white text-sm line-clamp-1">{plan.planTitle}</h3>
                          <p className="text-xs text-white/90 mt-0.5">
                            여행일정 {formatTripPeriod(plan.tripStartDate, plan.tripEndDate)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white p-3 flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> 소요 {formatRequiredTime(plan.requiredTime)}
                        </span>
                        <span>저장일 {formatIsoDate(plan.createAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!scrappedLoading && !scrappedError && scrappedPlans.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-4xl mb-4">🔖</div>
                  <p className="text-gray-500 font-medium mb-1">저장한 플랜이 없어요</p>
                  <p className="text-xs text-gray-400">마음에 드는 플랜을 저장해보세요!</p>
                </div>
              )}
            </div>
          )}

          {mainTab === 'plans' && (
            <div className="p-4">
              {plansLoading && <div className="py-10 text-center text-gray-500">플랜을 불러오는 중...</div>}

              {!plansLoading && plansError && (
                <div className="py-10 text-center text-red-500">{plansError}</div>
              )}

              {!plansLoading && !plansError && plans.length > 0 && (
                <div className="space-y-4">
                  {plans.map((plan) => {
                    const visibility = planVisibility[plan.planId];
                    const isPublic = visibility === true;
                    const isUnknown = visibility === undefined;
                    const isToggling = planVisibilityLoading[plan.planId] ?? false;
                    return (
                      <div
                        key={plan.planId}
                        role="link"
                        tabIndex={0}
                        onClick={() => router.push(`/my-course/${plan.planId}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            router.push(`/my-course/${plan.planId}`);
                          }
                        }}
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:opacity-80"
                      >
                        <div className="relative h-32">
                          <img
                            src={plan.planImages?.[0] ?? '/images/course-plan.png'}
                            alt={plan.planTitle}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute top-3 left-3">
                            <button
                              type="button"
                              disabled={isToggling}
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleTogglePlanVisibility(plan.planId);
                              }}
                              className={`text-[10px] text-white bg-white/20 backdrop-blur-sm rounded px-1.5 py-0.5 transition-colors ${
                                isToggling ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              aria-label={
                                isUnknown
                                  ? '플랜을 공개로 전환'
                                  : isPublic
                                  ? '플랜을 비공개로 전환'
                                  : '플랜을 공개로 전환'
                              }
                            >
                              {isToggling
                                ? '변경중...'
                                : isUnknown
                                ? '미설정'
                                : isPublic
                                ? '공개'
                                : '비공개'}
                            </button>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-bold text-white text-sm line-clamp-1">
                              {plan.planTitle}
                            </h3>
                            <p className="text-xs text-white/90 mt-0.5">
                              여행일정 {formatTripPeriod(plan.tripStartDate, plan.tripEndDate)} ·
                              소요 {formatRequiredTime(plan.requiredTime)}
                            </p>
                            {plan.createAt ? (
                              <p className="text-[10px] text-white/80 mt-1">
                                생성일 {formatIsoDate(plan.createAt)}
                              </p>
                            ) : (
                              <p className="text-[10px] text-white/80 mt-1">생성일 미정</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!plansLoading && !plansError && plans.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                    <Plus size={32} />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">아직 생성된 플랜이 없어요</p>
                  <p className="text-xs text-gray-400">계획을 만들어보세요!</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
