// 백엔드가 "img1" 같은 placeholder 문자열을 내려주는 경우가 있어
// next/image가 허용하는 형태(절대 URL 또는 / 시작 경로)만 통과시킨다.
const FALLBACK_IMAGE = '/images/course-plan.png';

export const getSafeImageSrc = (
  src: string | null | undefined,
  fallback: string = FALLBACK_IMAGE
): string => {
  if (!src) return fallback;
  if (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  return fallback;
};
