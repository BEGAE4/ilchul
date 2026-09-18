'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, MapPin, MoreVertical, UserX } from 'lucide-react';
import Avatar from '@/shared/ui/Avatar';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { useRequireAuth } from '@/features/authentication/hooks';
import { useReport, ReportDialog, ReportMenuItem } from '@/features/report';
import * as hiddenReportsStorage from '@/features/report/utils/hiddenReportsStorage';
import type { CurrentUser, ReportTarget } from '@/features/report';
import { sortMyPlansNewest } from '@/features/my-page/utils/sortPlans';
import { fetchMyPageProfile } from '@/features/my-page/api';
import { fetchUserPlans, fetchUserProfile, fetchUserProfileSummary } from '../api/user-profile.api';
import { classifyUserProfileError, isOwnProfile, parseUserId } from '../utils/userProfile';
import { PublicPlanCard } from './PublicPlanCard';
import type {
  PublicUserPlan,
  PublicUserProfile,
  PublicUserProfileSummary,
  UserProfileErrorKind,
} from '../types/user-profile.types';

interface UserProfilePageProps {
  /** 경로 파라미터 — 숫자 userId (플랜 상세 PlanDetailDto.userId) */
  userId: string;
}

type ProfileState =
  | { status: 'loading' }
  | { status: 'ready'; profile: PublicUserProfile }
  | { status: 'failed'; kind: UserProfileErrorKind };

type SectionState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'failed' };

const errorStatus = (err: unknown): number | null =>
  axios.isAxiosError(err) ? (err.response?.status ?? null) : null;

/**
 * 다른 사용자의 공개 프로필 (Figma I-1~I-4).
 * 마이페이지와 같은 뼈대지만 ① 뒤로가기 + 닉네임 + ⋮(신고) 헤더 ② '저장한 플랜' 통계·'저장 플랜' 탭 없음
 * ③ 카드에 공개 스위치 대신 인증 배지·받은 저장 수. 본인 프로필이면 ⋮ 를 숨긴다.
 */
export function UserProfilePage({ userId }: UserProfilePageProps) {
  const router = useRouter();
  // 백엔드 /api/profile/* 는 로그인이 필요하다(비로그인 401). 마이페이지와 같은 가드를 쓴다.
  const { ready } = useRequireAuth();
  const numericUserId = parseUserId(userId);

  const { user, isLoggedIn, updateProfile } = useUserStore();

  // 본인 여부는 닉네임으로 판별하는데, 스토어의 닉네임은 마이페이지/플랜 상세를 거쳐야 채워진다.
  // 이 화면에 바로 들어오면 비어 있으므로 한 번 채운다 (CourseViewPage 와 같은 방식).
  useEffect(() => {
    if (!ready || user.name) return;
    let alive = true;
    fetchMyPageProfile()
      .then((data) => {
        if (!alive) return;
        updateProfile({
          name: data.userNickname ?? '',
          avatar: data.userImg ?? '',
          title: data.userIntro ?? '',
          bio: data.userIntro ?? '',
        });
      })
      .catch((err) => console.error('내 프로필 로드 실패:', err));
    return () => {
      alive = false;
    };
  }, [ready, user.name, updateProfile]);

  const currentUser: CurrentUser = {
    id: user?.id ?? '',
    name: user?.name ?? '',
    isLoggedIn,
  };

  const [profileState, setProfileState] = useState<ProfileState>({ status: 'loading' });
  const [summaryState, setSummaryState] = useState<SectionState<PublicUserProfileSummary>>({ status: 'loading' });
  const [plansState, setPlansState] = useState<SectionState<PublicUserPlan[]>>({ status: 'loading' });

  const loadProfile = useCallback(async () => {
    if (!ready) return;
    if (numericUserId === null) {
      setProfileState({ status: 'failed', kind: 'not-found' });
      return;
    }
    setProfileState({ status: 'loading' });
    try {
      const profile = await fetchUserProfile(numericUserId);
      setProfileState({ status: 'ready', profile });
    } catch (err) {
      console.error('사용자 프로필 로드 실패:', err);
      setProfileState({ status: 'failed', kind: classifyUserProfileError(errorStatus(err)) });
    }
  }, [numericUserId, ready]);

  const loadSummary = useCallback(async () => {
    if (!ready || numericUserId === null) return;
    setSummaryState({ status: 'loading' });
    try {
      setSummaryState({ status: 'ready', data: await fetchUserProfileSummary(numericUserId) });
    } catch (err) {
      console.error('사용자 활동 요약 로드 실패:', err);
      setSummaryState({ status: 'failed' });
    }
  }, [numericUserId, ready]);

  const loadPlans = useCallback(async () => {
    if (!ready || numericUserId === null) return;
    setPlansState({ status: 'loading' });
    try {
      // 서버 순서가 정해져 있지 않아 마이페이지와 같이 생성 최신순으로 맞춘다
      setPlansState({ status: 'ready', data: sortMyPlansNewest(await fetchUserPlans(numericUserId)) });
    } catch (err) {
      console.error('사용자 공개 플랜 로드 실패:', err);
      setPlansState({ status: 'failed' });
    }
  }, [numericUserId, ready]);

  useEffect(() => {
    void loadProfile();
    void loadSummary();
    void loadPlans();
  }, [loadProfile, loadSummary, loadPlans]);

  useEffect(() => {
    const nickname = profileState.status === 'ready' ? profileState.profile.userNickname : '';
    document.title = nickname ? `${nickname} · 일출` : '프로필 · 일출';
  }, [profileState]);

  // ─── 신고 (⋮) ───
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const reportCtx = useReport();

  const profile = profileState.status === 'ready' ? profileState.profile : null;
  const nickname = profile?.userNickname || '여행자';
  const isSelf = isOwnProfile(currentUser, profile?.userNickname);

  // §9-3: 사용자 신고 대상. ownerId 는 닉네임(A7: 신고 기능이 닉네임으로 본인 여부를 판별)
  const userTarget: ReportTarget = {
    type: 'user',
    id: userId,
    ownerId: profile?.userNickname ?? '',
    nickname: profile?.userNickname ?? '',
    contextUrl: `/profile/${userId}`,
  };
  const showMoreButton = !!profile && !isSelf;

  const STATS: { label: string; value: number | string }[] = (() => {
    const v = (n: number) =>
      summaryState.status === 'loading' ? '...' : summaryState.status === 'failed' ? '—' : n;
    const d = summaryState.status === 'ready' ? summaryState.data : null;
    return [
      { label: '공개 플랜', value: v(d?.publicPlanCount ?? 0) },
      { label: '인증 플랜', value: v(d?.verifyPlanCount ?? 0) },
      { label: '받은 저장', value: v(d?.scrappedByOthersCount ?? 0) },
    ];
  })();

  const planCount = plansState.status === 'ready' ? plansState.data.length : null;

  // 로그인 확인 전 / 미로그인(리다이렉트 대기) 시 보호 콘텐츠 노출 방지 (ProfilePage 와 동일)
  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-32 text-sm text-gray-400">
        로그인 확인 중...
      </div>
    );
  }

  return (
    <div className="pb-24 bg-gray-50 min-h-dvh">
      {/* ─── 헤더 ─── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-gray-700 rounded-full"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1 line-clamp-1">
          {profileState.status === 'loading' ? '' : profileState.status === 'failed' ? '프로필' : nickname}
        </h1>
        {showMoreButton && (
          <button
            ref={moreButtonRef}
            onClick={() => setMenuOpen(true)}
            className="p-2 -mr-2 text-gray-700 rounded-full"
            aria-label="더보기"
          >
            <MoreVertical size={20} />
          </button>
        )}
      </div>

      {/* ─── 프로필 실패 (I-4: 없는 사용자 / 탈퇴한 사용자 / 오류) ─── */}
      {profileState.status === 'failed' && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <UserX size={32} />
          </div>
          {profileState.kind === 'withdrawn' ? (
            <>
              <p className="text-gray-500 font-medium mb-1">탈퇴한 사용자예요</p>
              <p className="text-xs text-gray-400">더 이상 프로필과 플랜을 볼 수 없어요</p>
            </>
          ) : profileState.kind === 'not-found' ? (
            <>
              <p className="text-gray-500 font-medium mb-1">찾을 수 없는 사용자예요</p>
              <p className="text-xs text-gray-400">주소가 잘못됐거나 사라진 계정일 수 있어요</p>
            </>
          ) : (
            <>
              <p className="text-gray-500 font-medium mb-1">프로필을 불러오지 못했어요</p>
              <p className="text-xs text-gray-400 mb-4">잠시 후 다시 시도해 주세요</p>
              <button
                onClick={() => {
                  void loadProfile();
                  void loadSummary();
                  void loadPlans();
                }}
                className="px-4 py-2 rounded-full bg-primary-500 text-white text-sm font-bold"
              >
                다시 시도
              </button>
            </>
          )}
        </div>
      )}

      {profileState.status !== 'failed' && (
        <>
          {/* ─── 프로필 섹션 ─── */}
          <div className="bg-white p-5 pb-0 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                {profileState.status === 'loading' ? (
                  <Skeleton variant="circle" width={60} height={60} />
                ) : (
                  <Avatar src={profile?.userImg} alt={nickname} size={60} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {profileState.status === 'loading' ? (
                  <>
                    <Skeleton variant="text" width={120} height={20} />
                    <Skeleton variant="text" width={200} height={14} className="mt-2" />
                  </>
                ) : (
                  <>
                    <h2 className="font-bold text-lg text-gray-900 line-clamp-1">{nickname}</h2>
                    {profile?.userIntro ? (
                      <p className="text-xs text-gray-400 mt-1">{profile.userIntro}</p>
                    ) : (
                      <p className="text-xs text-gray-300 mt-1">아직 소개가 없어요</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 통계 — 저장한 플랜은 본인 정보라 보여주지 않는다 */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center bg-gray-50 rounded-xl p-3">
                  <div className="text-xl font-bold text-primary-500">{stat.value}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* 탭 헤더 — 공개 플랜 하나뿐이라 전환 없이 제목 역할만 한다 */}
            <div className="flex border-b border-gray-100">
              <div className="flex-1 pb-3 text-sm font-bold text-primary-600 text-center relative">
                공개 플랜
                {planCount !== null && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-600">
                    {planCount}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* ─── 공개 플랜 목록 ─── */}
          <div className="p-4">
            {plansState.status === 'loading' && (
              <div className="space-y-4">
                {[0, 1].map((i) => (
                  <Skeleton key={i} variant="image" height={128} className="rounded-xl" />
                ))}
              </div>
            )}

            {plansState.status === 'failed' && (
              <div className="py-10 flex flex-col items-center text-center">
                <p className="text-sm text-gray-500 mb-3">공개 플랜을 불러오지 못했어요</p>
                <button
                  onClick={() => void loadPlans()}
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600"
                >
                  다시 시도
                </button>
              </div>
            )}

            {plansState.status === 'ready' && plansState.data.length > 0 && (
              <div className="space-y-4">
                {plansState.data.map((plan) => (
                  <PublicPlanCard
                    key={plan.planId}
                    plan={plan}
                    onClick={() => router.push(`/course/${plan.planId}`)}
                  />
                ))}
              </div>
            )}

            {plansState.status === 'ready' && plansState.data.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <MapPin size={32} />
                </div>
                <p className="text-gray-500 font-medium mb-1">아직 공개한 플랜이 없어요</p>
                <p className="text-xs text-gray-400">이 여행자가 플랜을 공개하면 여기서 볼 수 있어요</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── 더보기 인라인 시트 ─── */}
      {/* BottomMenu는 items: MenuItem[] 배열만 지원하고 children/slot 미지원이므로
          CourseViewPage의 isMenuOpen 패턴(인라인 bottom-sheet)을 동일하게 재사용한다 */}
      {menuOpen && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-4 shadow-xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <ReportMenuItem
              target={userTarget}
              currentUser={currentUser}
              onSelect={() => {
                setMenuOpen(false);
                reportCtx.open(userTarget);
              }}
            />
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full py-3 text-gray-400 font-bold text-sm mt-1"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ─── 신고 다이얼로그 ─── */}
      <ReportDialog
        isOpen={reportCtx.isOpen}
        target={reportCtx.target ?? userTarget}
        isSubmitting={reportCtx.isSubmitting}
        triggerRef={moreButtonRef}
        onSubmit={(rc, d) => reportCtx.submit(reportCtx.target ?? userTarget, rc, d)}
        onClose={reportCtx.close}
        onHideContent={(t) => {
          // 사용자 신고 후 숨기기: 로컬 스토리지에만 기록.
          // 디바이스 간 동기화 없음 (Q7). 영구 차단은 별도 user-block feature 담당 (A4).
          hiddenReportsStorage.add(t);
        }}
      />
    </div>
  );
}
