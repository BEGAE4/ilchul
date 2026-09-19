import { fitWithinEdge, loadImage, shouldReencodeImage, toJpegFileName } from './stripImageMetadata';

// 운영 앞단(nginx)이 요청 본문을 1MB 로 제한한다 (2026-09-18 확인: 0.9MB 통과 · 1.5MB 부터 413, 0.6MB 두 장도 413).
// 백엔드는 5MB 를 허용하지만 요청이 닿기도 전에 거절되고, 413 은 HTML 이라 사용자에게 이유를 보여줄 수도 없었다.
// 휴대폰 사진은 보통 2~5MB 라 스탬프·플랜 사진·문의 첨부가 실제 사진으로는 전부 실패하고 있었다.
// 그래서 올리기 전에 항상 줄인다. 제한은 파일이 아니라 **요청 전체**에 걸리므로 장수도 함께 고려한다.
/** multipart 경계·다른 필드 몫을 남긴 한 요청의 안전 용량 */
export const SAFE_REQUEST_BYTES = 900 * 1024;
const DEFAULT_MAX_EDGE = 1600;
const SMALLER_EDGES = [1280, 1024, 800, 640];
const QUALITIES = [0.9, 0.8, 0.7, 0.6];

/** 긴 변을 한도에 맞춘 크기. 비율을 지키고, 아주 길쭉한 사진도 한 변이 0 이 되지 않게 한다 */
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } {
  const fitted = fitWithinEdge(width, height, maxEdge);
  return { width: Math.max(1, fitted.width), height: Math.max(1, fitted.height) };
}

/** 용량이 안 맞으면 차례로 시도할 긴 변 크기 */
export function edgeSteps(maxEdge: number): number[] {
  return [maxEdge, ...SMALLER_EDGES.filter((e) => e < maxEdge)];
}

/** 한 요청에 여러 장을 담을 때 한 장에 쓸 수 있는 용량 */
export function perImageBudget(count: number, total: number = SAFE_REQUEST_BYTES): number {
  return Math.floor(total / Math.max(1, count));
}

/** JPEG·HEIC·WEBP 는 EXIF(촬영 위치)를 지우려고 항상 다시 그린다. PNG·GIF 는 한도를 넘을 때만 */
export function needsShrink(type: string, size: number, maxBytes: number): boolean {
  return shouldReencodeImage(type) || size > maxBytes;
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
 * 업로드할 사진을 한도 아래의 JPEG 로 줄인다. 다시 그리는 과정에서 EXIF 도 사라진다.
 * 열 수 없는 형식(예: 크롬의 HEIC)은 원본이 한도 안이면 그대로 보내고, 넘으면 `image_too_large` 를 던진다.
 */
export async function prepareImageForUpload(
  file: File,
  { maxEdge = DEFAULT_MAX_EDGE, maxBytes = SAFE_REQUEST_BYTES } = {}
): Promise<File> {
  if (typeof document === 'undefined') return file;
  if (!needsShrink(file.type, file.size, maxBytes)) return file;

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    if (file.size <= maxBytes) return file;
    throw new Error('image_too_large');
  }

  for (const edge of edgeSteps(maxEdge)) {
    const canvas = draw(img, edge);
    if (!canvas) break;
    for (const quality of QUALITIES) {
      const blob = await toJpeg(canvas, quality);
      if (blob && blob.size <= maxBytes) {
        return new File([blob], toJpegFileName(file.name), {
          type: 'image/jpeg',
          lastModified: file.lastModified,
        });
      }
    }
  }
  if (file.size <= maxBytes) return file;
  throw new Error('image_too_large');
}

/** 한 요청에 함께 담을 사진들 — 장수만큼 용량을 나눠 줄인다. 메모리 때문에 차례로 처리한다 */
export async function prepareImagesForOneRequest(files: File[]): Promise<File[]> {
  const maxBytes = perImageBudget(files.length);
  const out: File[] = [];
  for (const file of files) out.push(await prepareImageForUpload(file, { maxBytes }));
  return out;
}

export function isImageTooLarge(err: unknown): boolean {
  if (err instanceof Error && err.message === 'image_too_large') return true;
  const e = err as { isAxiosError?: boolean; response?: { status?: number } } | null;
  return !!e?.isAxiosError && e.response?.status === 413;
}

/** 사진 업로드 실패 안내. 용량·네트워크만 따로 말하고 나머지는 화면이 준 기본 문구를 쓴다 */
export function photoUploadErrorMessage(err: unknown, fallback: string): string {
  if (isImageTooLarge(err)) return '사진 용량이 너무 커요. 다른 사진으로 시도해주세요.';
  const e = err as { isAxiosError?: boolean; response?: unknown } | null;
  if (e?.isAxiosError && e.response === undefined) return '네트워크 연결을 확인한 뒤 다시 시도해주세요.';
  return fallback;
}
