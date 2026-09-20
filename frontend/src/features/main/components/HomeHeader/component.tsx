'use client';

import Header from '@/shared/ui/Header';

interface HomeHeaderProps {
  onProfileClick: () => void;
  /** 로그인 상태면 프로필 사진 URL. 없으면 회색 기본 아바타가 뜬다. */
  profileImage?: string;
}

/**
 * 홈 상단 브랜드 헤더.
 *
 * 로고를 만나는 지점이 인트로·로그인뿐이라 홈에도 상단 고정 헤더로 노출한다.
 * 심볼(30px)만 두면 어떤 서비스인지 읽히지 않으므로 워드마크를 함께 둔다.
 *
 * 로고는 next/image 가 아니라 <img> 로 넣는다 — next.config 에 dangerouslyAllowSVG 가
 * 없어 /_next/image 가 로컬 SVG 를 400 으로 거절한다(인트로·로그인 화면과 동일한 처리).
 *
 * Header 는 position: fixed(56px) 이므로 본문은 그만큼 위쪽 여백을 둬야 한다.
 */
export const HomeHeader = ({ onProfileClick, profileImage }: HomeHeaderProps) => (
  <Header
    variant="logo"
    onProfileClick={onProfileClick}
    profileImage={profileImage}
    logo={
      <span className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" aria-hidden width={28} height={28} />
        <span className="text-xl font-bold text-gray-900">일출</span>
      </span>
    }
  />
);
