'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Settings, Plus, Eye, EyeOff, Trash2, X, Heart, Bookmark, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';
import {
  fetchMyPlans,
  fetchMyPageProfile,
  fetchMyPageSummary,
  setMyPlanVisibility,
} from '@/features/my-page/api';
import type { MyPlan } from '@/features/my-page/types/plan.types';
import type { MyPageSummary } from '@/features/my-page/types/summary.types';

type MainTab = 'courses' | 'bookmarks' | 'plans';
type CourseFilter = 'all' | 'public' | 'private';

export const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, updateProfile } = useUserStore();
  const { myCourses, courses, deleteMyCourse, toggleVisibility, getBookmarkedCourses, toggleBookmark, bookmarkedIds } = useCourseStore();
  const [mainTab, setMainTab] = useState<MainTab>('courses');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
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
              if (typeof plan.isPublic === 'boolean') {
                next[plan.planId] = plan.isPublic;
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

  const filteredCourses = myCourses.filter((course) => {
    if (courseFilter === 'all') return true;
    if (courseFilter === 'public') return course.isPublic;
    if (courseFilter === 'private') return !course.isPublic;
    return true;
  });

  const savedCourses = getBookmarkedCourses();

  const STATS: { label: string; value: number | string; color: string }[] = [
    {
      label: '공개 코스',
      value: summaryLoading
        ? '...'
        : summaryError
        ? '—'
        : summary?.publicPlanCount ?? 0,
      color: 'text-sky-500',
    },
    {
      label: '인증 코스',
      value: summaryLoading
        ? '...'
        : summaryError
        ? '—'
        : summary?.verifyPlanCount ?? 0,
      color: 'text-emerald-500',
    },
    {
      label: '받은 저장',
      value: summaryLoading
        ? '...'
        : summaryError
        ? '—'
        : summary?.scrappedByOthersCount ?? 0,
      color: 'text-violet-500',
    },
    {
      label: '저장한 코스',
      value: summaryLoading
        ? '...'
        : summaryError
        ? '—'
        : summary?.savedCourseCount ?? 0,
      color: 'text-amber-500',
    },
  ];

  const formatIsoDate = (iso: string | null) => {
    if (!iso) return '생성일 미정';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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

  const handleDeleteCourse = () => {
    if (courseToDelete) {
      deleteMyCourse(courseToDelete);
      setCourseToDelete(null);
      toast.success('코스가 삭제되었어요.');
    }
  };

  const handleToggleVisibility = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const course = myCourses.find((c) => c.id === courseId);
    toggleVisibility(courseId);
    toast(course?.isPublic ? '비공개로 전환했어요.' : '공개로 전환했어요.');
  };

  const TABS: { key: MainTab; label: string; count: number }[] = [
    { key: 'courses', label: '내 코스', count: myCourses.length },
    { key: 'bookmarks', label: '저장 코스', count: savedCourses.length },
    { key: 'plans', label: '내 플랜', count: plans.length },
  ];

  return (
    <div className="pb-24 bg-gray-50 min-h-full">
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
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
            <Image
              src={user?.avatar ?? 'https://i.pravatar.cc/150?u=me'}
              alt="프로필"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900">
              {user?.name ?? '김여행'}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              여행 레벨 {user?.level ?? 3} · {user?.travelType ?? '힐링 마스터'}
            </div>
            {user?.bio && (
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
                mainTab === tab.key ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                mainTab === tab.key ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab.count}
              </span>
              {mainTab === tab.key && (
                <motion.div
                  layoutId="mainTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"
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
          initial={{ opacity: 0, x: mainTab === 'courses' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mainTab === 'courses' ? 20 : -20 }}
          transition={{ duration: 0.2 }}
        >
          {mainTab === 'courses' && (
            <>
              {/* 코스 필터 */}
              <div className="bg-white border-b border-gray-100 px-5 py-2.5 flex gap-2">
                {([
                  ['all', `전체 ${myCourses.length}`],
                  ['public', `공개 ${myCourses.filter((c) => c.isPublic).length}`],
                  ['private', `숨김 ${myCourses.filter((c) => !c.isPublic).length}`],
                ] as const).map(([filter, label]) => (
                  <button
                    key={filter}
                    onClick={() => setCourseFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      courseFilter === filter
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {filteredCourses.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => router.push(`/my-course/${course.id}`)}
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer"
                      >
                        <div className="flex">
                          <div className="relative w-24 h-24 shrink-0">
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 p-3 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                                {course.title}
                              </h3>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {course.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                {course.location} · {course.duration}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => handleToggleVisibility(course.id, e)}
                                  className={`p-2.5 rounded-lg transition-colors ${
                                    course.isPublic
                                      ? 'bg-sky-50 text-sky-500'
                                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                  }`}
                                  aria-label={course.isPublic ? '비공개로 전환' : '공개로 전환'}
                                >
                                  {course.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCourseToDelete(course.id);
                                  }}
                                  className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors"
                                  aria-label="코스 삭제"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                      <Plus size={32} />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">
                      {courseFilter === 'all'
                        ? '아직 생성된 코스가 없어요'
                        : '해당하는 코스가 없어요'}
                    </p>
                    <p className="text-xs text-gray-400 mb-6">
                      나만의 힐링 코스를 만들어보세요!
                    </p>
                    {courseFilter === 'all' && (
                      <button
                        onClick={() => router.push('/create')}
                        className="bg-sky-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-sky-200 active:scale-95 transition-transform"
                      >
                        코스 생성하기
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {mainTab === 'bookmarks' && (
            <div className="p-4">
              {savedCourses.length > 0 ? (
                <div className="space-y-4">
                  {savedCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => router.push(`/course/${course.id}`)}
                      className="relative rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer"
                    >
                      <div className="relative h-36">
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(course.id);
                            toast(bookmarkedIds.has(course.id) ? '저장을 해제했어요.' : '저장했어요!');
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow"
                        >
                          <Bookmark
                            size={16}
                            fill={bookmarkedIds.has(course.id) ? '#3b82f6' : 'none'}
                            className="text-blue-500"
                          />
                        </button>
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex gap-1.5 mb-1">
                            {course.tags?.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[10px] text-white bg-white/20 backdrop-blur-sm rounded px-1.5 py-0.5">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="font-bold text-white text-sm line-clamp-1">{course.title}</h3>
                        </div>
                      </div>
                      <div className="bg-white p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative w-5 h-5 rounded-full overflow-hidden">
                            <Image
                              src={course.authorAvatar ?? 'https://i.pravatar.cc/40'}
                              alt={course.author ?? ''}
                              fill
                              sizes="20px"
                              className="object-cover"
                            />
                          </div>
                          <span className="text-xs text-gray-500">{course.author}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-0.5">
                            <Heart size={10} /> {course.likes}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Bookmark size={10} /> {course.bookmarks}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-4xl mb-4">🔖</div>
                  <p className="text-gray-500 font-medium mb-1">저장한 코스가 없어요</p>
                  <p className="text-xs text-gray-400">마음에 드는 코스를 저장해보세요!</p>
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
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-default"
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
                              여행일정 {formatIsoDate(plan.tripDate)} · 장소 {plan.placeCount}개
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

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCourseToDelete(null)} />
          <div className="relative bg-white rounded-2xl p-6 mx-5 w-full max-w-[320px] shadow-lg">
            <h2 className="text-gray-900 text-lg font-bold mb-2">
              코스를 삭제하시겠어요?
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              삭제된 코스는 복구할 수 없습니다.
              <br />
              정말로 삭제하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCourseToDelete(null)}
                className="bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-sm flex-1 hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleDeleteCourse}
                className="bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex-1 shadow-md shadow-red-200 hover:bg-red-600"
              >
                삭제하기
              </button>
            </div>
            <button
              onClick={() => setCourseToDelete(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
