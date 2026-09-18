'use client';

import NextImage from 'next/image';
import { useEffect, useState } from 'react';

type Size = 'xs' | 'sm' | 'md' | 'lg';

interface CoverImageProps {
  /** 대표 이미지 후보 — 없거나 무효하거나 불러오지 못하면 기본 커버를 그린다 */
  src?: string | null;
  alt: string;
  /** 항목마다 그라데이션 방향을 달리하는 시드 (planId·placeId 권장) */
  seed?: number | string;
  /**
   * 기본 커버의 로고 크기.
   * xs: 48px 이하 썸네일 / sm: 목록·카드 썸네일 / md: 가로 카드 / lg: 상세 히어로
   */
  size?: Size;
  /** next/image sizes */
  sizes?: string;
  priority?: boolean;
  /** 이미지가 있을 때만 적용되는 추가 클래스 (object-position, hover 확대 등) */
  imageClassName?: string;
}

// 장소·플랜의 대표 이미지. 부모가 relative + 크기를 주고, 이 컴포넌트가 그 영역을 채운다.
//
// 이미지가 없을 때 처리가 화면마다 달랐다 — 장소와 홈의 플랜 카드는 구름 사진(course-plan.png),
// 나머지 플랜은 해 아이콘 + 문구, 코스 만들기 장소는 지도 핀. 같은 플랜이 홈과 마이페이지에서
// 서로 다르게 보였다. 브랜드 그라데이션 위에 일출 로고만 은은하게 띄운 기본 커버 하나로 통일한다.
//
// 주소가 있는데 깨진 경우도 같은 커버를 쓴다. 보는 사람에게는 '사진 없음'과 차이가 없고,
// 외부 장소 사진이 가끔 깨질 때마다 오류 아이콘이 뜨면 서비스가 고장 난 것처럼 보인다.
// (내가 올린 사진의 업로드 실패는 구분해야 해서 ReviewPhoto 가 따로 오류를 보여준다.)

function normalize(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim();
  if (!v) return null;
  if (v.startsWith('/') || v.startsWith('data:') || v.startsWith('blob:')) return v;
  try {
    const u = new URL(v);
    if (u.protocol === 'https:') return v;
    if (u.protocol === 'http:') {
      const isLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
      if (!isLocal) u.protocol = 'https:';
      return u.toString();
    }
  } catch {
    /* 무효 URL — 시드 데이터의 'img1' 같은 값 */
  }
  return null;
}

function hashSeed(seed: number | string | undefined): number {
  const s = String(seed ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const LOGO_SIZE: Record<Size, number> = { xs: 18, sm: 32, md: 44, lg: 64 };

export default function CoverImage({
  src,
  alt,
  seed,
  size = 'md',
  sizes = '100vw',
  priority,
  imageClassName = '',
}: CoverImageProps) {
  const resolved = normalize(src);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (resolved !== null && !failed) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <NextImage
          src={resolved}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={!resolved.startsWith('/')}
          className={`object-cover ${imageClassName}`}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  // 항목마다 그라데이션 방향만 달리해 목록에서 구분되게 한다 (120°~240°, 색은 브랜드 토큰 고정).
  // 같은 항목은 늘 같은 방향이다.
  const angle = 120 + (hashSeed(seed) % 5) * 30;
  const logo = LOGO_SIZE[size];

  return (
    <div
      role="img"
      aria-label={`${alt} — 이미지 없음`}
      className="absolute inset-0 overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(${angle}deg, var(--color-primary-100) 0%, var(--color-primary-300) 55%, var(--color-accent-200) 100%)`,
      }}
    >
      {/* 은은한 도트 — 단색 블록처럼 보이지 않게 */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />
      {/*
        로고를 흰 실루엣으로 60% 만 띄운다. 컬러 로고는 파랑·주황이 배경과 섞여 탁해진다(Figma G ①).
        next/image 는 dangerouslyAllowSVG 없이 로컬 SVG 를 거절해 <img> 로 넣는다.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.svg"
        alt=""
        aria-hidden
        width={logo}
        height={logo}
        className="relative opacity-60 [filter:brightness(0)_invert(1)]"
      />
    </div>
  );
}
