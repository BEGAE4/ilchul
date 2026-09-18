'use client';

import SafeImage from '@/shared/ui/SafeImage';
import type { AvatarProps } from './types';
import styles from './styles.module.scss';

/** 프로필 사진이 없거나 깨졌을 때 쓰는 일출 기본 아바타 (Figma "기본 아바타" 컴포넌트를 내보낸 것) */
export const DEFAULT_AVATAR = '/images/default-avatar.svg';

// 사용자 프로필 사진. 마이페이지·플랜 작성자·댓글·장소 리뷰·헤더가 모두 이걸 쓴다.
//
// 이전에는 사진이 없을 때 화면마다 달랐다 — 마이페이지·플랜 작성자·장소 리뷰는 회색 사람 아이콘,
// 헤더는 빈 회색 원, 플랜 댓글은 SafeImage 공용 플레이스홀더인 비행기 사진. 같은 사람이 화면마다
// 다르게 보였고, 댓글의 비행기는 프로필로 보이지도 않았다. 브랜드 그라데이션 위에 로고를 띄운
// 기본 아바타 하나로 통일한다.
//
// 규칙
//  - src 가 null / '' / 무효 URL → 기본 아바타 (SafeImage 가 요청 없이 바로 폴백)
//  - URL 은 있는데 로드 실패 → 기본 아바타 (비행기 사진이 아니라)
//  - 카카오 기본 실루엣(default_profile.jpeg)은 서버가 준 정상 사진이므로 그대로 보여준다
//  - 흰 테두리·그림자는 감싸는 요소가 결정한다. 여기서는 원형 + 이미지만 그린다
export default function Avatar({ src, alt, size, className = '' }: AvatarProps) {
  return (
    <div className={`${styles.avatar} ${className}`} style={{ width: size, height: size }}>
      <SafeImage
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
        fallbackSrc={DEFAULT_AVATAR}
      />
    </div>
  );
}
