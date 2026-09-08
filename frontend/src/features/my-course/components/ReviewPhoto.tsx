'use client';

import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import Image from '@/shared/ui/SafeImage';

interface ReviewPhotoProps {
  src: string;
  alt: string;
}

// http(s)/로컬 경로/데이터 URL 만 브라우저가 그릴 수 있다. 그 외(스킴 없는 값, 치환되지 않은
// '${STORAGE_PUBLIC_URL}/…' 등)는 SafeImage 가 조용히 플레이스홀더로 바꾸므로 여기서 먼저 걸러
// '불러오지 못함' 으로 보여준다.
function isRenderableSrc(src: string): boolean {
  return /^(https?:\/\/|\/|data:|blob:)/.test(src.trim());
}

// 여행 기록·플랜 사진 한 장. 부모가 relative + aspect-square + overflow-hidden 박스를 준다.
// 이전에는 SafeImage 가 로드 실패를 구름 플레이스홀더(course-plan.png)로 덮어, 업로드는 됐는데
// 사진이 안 보이는 상황을 QA 가 '기본 이미지 사용' 으로 오인했다 (QA C-06).
// 실패하면 아이콘 + 문구로 구분해 보여준다.
export function ReviewPhoto({ src, alt }: ReviewPhotoProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !isRenderableSrc(src)) {
    return (
      <div
        role="img"
        aria-label={`${alt} — 이미지를 불러오지 못했어요`}
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gray-100 text-gray-400"
      >
        <ImageOff size={16} />
        <span className="text-[9px] leading-none">불러오지 못함</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="100px"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
