'use client';

import NextImage from 'next/image';
import { useEffect, useState } from 'react';
import { ImageOff, Sunrise } from 'lucide-react';

type Size = 'sm' | 'md' | 'lg';

interface PlanCoverProps {
  /** 대표 이미지 후보 — 없거나 무효면 '이미지 없음' UI 를 그린다 */
  src?: string | null;
  alt: string;
  /** 플랜마다 그라데이션 방향을 달리하는 시드 (planId 권장) */
  seed?: number | string;
  /** sm: 목록 썸네일(아이콘만) / md: 카드 / lg: 상세 히어로 */
  size?: Size;
  /** next/image sizes */
  sizes?: string;
  priority?: boolean;
  /** 이미지가 있을 때만 적용되는 추가 클래스 (object-position 등) */
  imageClassName?: string;
}

// 이전에는 이미지가 없는 모든 플랜이 같은 구름 사진(course-plan.png)을 써서 목데이터처럼 보였다.
// 사진이 없을 때는 브랜드 그라데이션 + 아이콘으로 '플랜 커버'임을 드러내고,
// 로드에 실패했을 때는 같은 톤 위에 '불러오지 못함'을 구분해 보여준다.

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
    /* 무효 URL */
  }
  return null;
}

function hashSeed(seed: number | string | undefined): number {
  const s = String(seed ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const ICON_SIZE: Record<Size, number> = { sm: 18, md: 28, lg: 40 };
const LABEL_CLASS: Record<Size, string> = {
  sm: 'hidden',
  md: 'text-[11px]',
  lg: 'text-xs',
};

export default function PlanCover({
  src,
  alt,
  seed,
  size = 'md',
  sizes = '100vw',
  priority,
  imageClassName = '',
}: PlanCoverProps) {
  const resolved = normalize(src);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  const showImage = resolved !== null && !failed;
  const isError = resolved !== null && failed;

  // 플랜마다 그라데이션 방향만 살짝 달리해 목록에서 구분되게 한다 (색은 브랜드 토큰 고정)
  const angle = 120 + (hashSeed(seed) % 5) * 30; // 120°~240°
  const background = `linear-gradient(${angle}deg, var(--color-primary-100) 0%, var(--color-primary-300) 55%, var(--color-accent-200) 100%)`;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden={showImage ? undefined : true}>
      {showImage ? (
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
      ) : (
        <div
          role="img"
          aria-label={isError ? `${alt} — 이미지를 불러오지 못했어요` : `${alt} — 등록된 이미지 없음`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
          style={{ background }}
        >
          {/* 은은한 도트 패턴 — 단색 블록처럼 보이지 않게 */}
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          />
          <div
            className={`relative flex items-center justify-center rounded-full bg-white/70 text-primary-600 shadow-sm ${
              size === 'lg' ? 'w-16 h-16' : size === 'md' ? 'w-11 h-11' : 'w-8 h-8'
            }`}
          >
            {isError ? <ImageOff size={ICON_SIZE[size]} /> : <Sunrise size={ICON_SIZE[size]} />}
          </div>
          <span className={`relative font-bold text-primary-700/80 ${LABEL_CLASS[size]}`}>
            {isError ? '이미지를 불러오지 못했어요' : '아직 사진이 없는 플랜이에요'}
          </span>
        </div>
      )}
    </div>
  );
}
