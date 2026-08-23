'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, User } from 'lucide-react';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { useReport, ReportDialog, ReportMenuItem, isSelfReport } from '@/features/report';
import * as hiddenReportsStorage from '@/features/report/utils/hiddenReportsStorage';
import type { CurrentUser, ReportTarget } from '@/features/report';

interface UserProfilePageProps {
  userId: string;
}

/**
 * 다른 사용자의 프로필 페이지.
 * 공개 프로필 조회 API가 아직 없어 닉네임(userId)과 신고 기능만 제공한다.
 */
export function UserProfilePage({ userId }: UserProfilePageProps) {
  const router = useRouter();

  const { user, isLoggedIn } = useUserStore();
  const currentUser: CurrentUser = {
    id: user?.id ?? '',
    name: user?.name ?? '',
    isLoggedIn,
  };

  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const reportCtx = useReport();

  // §9-3: 사용자 신고 대상. ownerId === userId (닉네임 키, A7 가정)
  const userTarget: ReportTarget = {
    type: 'user',
    id: userId,
    ownerId: userId,
    nickname: userId,
    contextUrl: `/profile/${userId}`,
  };

  // 본인 프로필이면 ⋮ 버튼 자체를 숨긴다 (§F 결정).
  const showMoreButton = !isSelfReport(currentUser, userTarget);

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-gray-700 rounded-full"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">{userId}</h1>
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

      {/* 프로필 섹션 */}
      <div className="bg-white p-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{userId}</h2>
          </div>
        </div>
      </div>

      {/* 공개 프로필 미제공 안내 */}
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <p className="text-gray-500 font-medium mb-1">아직 제공되지 않는 기능이에요</p>
        <p className="text-xs text-gray-400">다른 여행자의 공개 플랜은 곧 만나볼 수 있어요</p>
      </div>

      {/* ─── 더보기 인라인 시트 ─── */}
      {/* BottomMenu는 items: MenuItem[] 배열만 지원하고 children/slot 미지원이므로
          CourseViewPage의 isMenuOpen 패턴(인라인 bottom-sheet)을 동일하게 재사용한다 */}
      {menuOpen && (
        <div className="fixed inset-y-0 app-frame z-50 flex items-end">
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
