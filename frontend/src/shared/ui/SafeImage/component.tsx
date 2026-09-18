'use client';

import NextImage, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

/** 이미지가 없거나 깨졌을 때 쓰는 로컬 플레이스홀더 */
export const PLACEHOLDER_IMAGE = '/images/course-plan.png';

type SafeImageProps = Omit<ImageProps, 'src'> & {
  /** 서버 응답 그대로 — null/빈 문자열/무효 URL 모두 허용 */
  src?: string | null;
  /** 무효·로드 실패 시 대체 이미지 (기본: PLACEHOLDER_IMAGE) */
  fallbackSrc?: string;
};

// 서버가 내려주는 이미지 URL 은 출처가 제각각이고(Google Places, 카카오 CDN, S3 커스텀 도메인)
// 시드 데이터에는 'img1' 같은 무효 값도 섞여 있다. next/image 최적화기는 remotePatterns 에 없는
// 호스트나 무효 URL 을 /_next/image 에서 400 으로 거절해 화면이 비어 보였다.
//  - 로컬 경로('/…')는 최적화기를 그대로 쓴다
//  - 절대 http(s) URL 은 unoptimized 로 원본을 직접 로드한다 (remotePatterns 무관)
//  - 그 외(무효 값)는 플레이스홀더로 대체하고, 로드 실패(onError) 시에도 플레이스홀더로 떨어진다
function resolve(raw: string | null | undefined, fallback: string): { src: string; remote: boolean } {
  const v = (raw ?? '').trim();
  if (!v) return { src: fallback, remote: false };
  if (v.startsWith('/') || v.startsWith('data:') || v.startsWith('blob:')) return { src: v, remote: false };
  try {
    const u = new URL(v);
    if (u.protocol === 'https:') return { src: v, remote: true };
    if (u.protocol === 'http:') {
      // 카카오 프로필(http://img1.kakaocdn.net/…)처럼 http 로 오는 URL 은 https 페이지에서
      // 혼합 콘텐츠로 차단될 수 있다. 로컬 개발 서버를 제외하고 https 로 승격한다.
      const isLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
      if (!isLocal) u.protocol = 'https:';
      return { src: u.toString(), remote: true };
    }
  } catch {
    /* 무효 URL */
  }
  return { src: fallback, remote: false };
}

export default function SafeImage({
  src,
  fallbackSrc = PLACEHOLDER_IMAGE,
  onError,
  unoptimized,
  ...rest
}: SafeImageProps) {
  const resolved = resolve(src, fallbackSrc);
  const [failed, setFailed] = useState(false);

  // src 가 바뀌면 실패 상태를 초기화한다
  useEffect(() => {
    setFailed(false);
  }, [resolved.src]);

  const finalSrc = failed ? fallbackSrc : resolved.src;
  const finalUnoptimized = failed ? false : (unoptimized ?? resolved.remote);

  return (
    <NextImage
      {...rest}
      src={finalSrc}
      unoptimized={finalUnoptimized}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}
