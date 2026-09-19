import { fitWithinEdge, loadImage, toJpegFileName } from './stripImageMetadata';

// 운영 앞단(nginx)의 업로드 제한이 1MB 다 (2026-09-18 확인: 0.9MB 200 / 1.5MB 413). 휴대폰 사진은 보통 2~5MB 라
// 그대로 보내면 서버에 닿기도 전에 거절된다. 프로필 사진은 크게 볼 일이 없으므로 올리기 전에 줄인다.
const DEFAULT_MAX_EDGE = 1024;
const DEFAULT_MAX_BYTES = 900 * 1024;
const QUALITIES = [0.9, 0.8, 0.7, 0.6];
const FALLBACK_EDGE = 640;

/** 긴 변을 한도에 맞춘 크기. 비율을 지키고, 아주 길쭉한 사진도 한 변이 0 이 되지 않게 한다 */
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } {
  const fitted = fitWithinEdge(width, height, maxEdge);
  return { width: Math.max(1, fitted.width), height: Math.max(1, fitted.height) };
}

function draw(img: HTMLImageElement, maxEdge: number): HTMLCanvasElement | null {
  const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, maxEdge);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  // JPEG 에는 투명도가 없다 — 투명한 PNG 가 검게 나오지 않도록 흰 바탕을 먼저 깐다
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));

/**
 * 업로드용으로 줄인 JPEG 사본을 돌려준다. 다시 그리는 과정에서 EXIF(촬영 위치 등)도 함께 사라진다.
 * 열 수 없는 사진이면 `image_decode_failed` 를 던진다 — 호출부가 사용자에게 알린다.
 */
export async function resizeImageForUpload(
  file: File,
  { maxEdge = DEFAULT_MAX_EDGE, maxBytes = DEFAULT_MAX_BYTES } = {}
): Promise<File> {
  if (typeof document === 'undefined') return file;
  const img = await loadImage(file);

  let smallest: Blob | null = null;
  for (const edge of [maxEdge, FALLBACK_EDGE]) {
    const canvas = draw(img, edge);
    if (!canvas) break;
    for (const quality of QUALITIES) {
      const blob = await toJpeg(canvas, quality);
      if (!blob) continue;
      if (!smallest || blob.size < smallest.size) smallest = blob;
      if (blob.size <= maxBytes) {
        return new File([blob], toJpegFileName(file.name), { type: 'image/jpeg' });
      }
    }
  }
  if (!smallest) throw new Error('image_decode_failed');
  return new File([smallest], toJpegFileName(file.name), { type: 'image/jpeg' });
}
