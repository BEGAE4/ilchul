import { fitWithinEdge, loadImage, shouldReencodeImage, toJpegFileName } from './stripImageMetadata';

// 서버 업로드 한도 (2026-09-20 백엔드 반영, 3차 요청 038 §2):
//   파일 하나 15MB · 한 요청 5장 · 한 요청 80MB (앞단 nginx 90MB). 형식은 JPEG·PNG·WEBP 만 받는다.
//   413 도 이제 JSON({status, message})으로 온다.
// 이전에는 앞단이 요청 전체를 1MB 로 막아, 모든 사진을 900KB 아래로 줄이고 한 장씩 보냈다.
// 한도가 풀린 지금도 올리기 전에 줄인다 — 휴대폰 원본(2~5MB, 12MP)은 화면에 필요한 크기를 한참 넘고,
// 다시 그리는 과정에서 EXIF(촬영 위치)가 지워지며, 야외의 약한 통신망에서 업로드가 끝나야 하기 때문이다.
// 다만 화질을 깎을 만큼 조일 필요는 없어졌다: 긴 변 2048px, 장당 3MB 면 대부분 품질 0.9 로 한 번에 맞는다.
/** 한 장의 한도 — 서버 파일 한도(15MB)보다 한참 작게 잡는다 */
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
/** 서버가 한 요청에 받는 최대 장수 (StorageErrorCode.TOO_MANY_FILES) */
export const MAX_IMAGES_PER_REQUEST = 5;
/** multipart 경계·다른 필드 몫을 남긴 한 요청의 안전 용량 (서버 80MB) */
export const SAFE_REQUEST_BYTES = 60 * 1024 * 1024;
/** 서버 ImageFileValidator 가 받는 형식 */
const UPLOADABLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DEFAULT_MAX_EDGE = 2048;
const SMALLER_EDGES = [1600, 1280, 1024, 800, 640];
const QUALITIES = [0.9, 0.8, 0.7, 0.6];

export function isUploadableType(type: string): boolean {
  return UPLOADABLE_TYPES.has(type.toLowerCase());
}

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

/** 한 요청에 여러 장을 담을 때 한 장에 쓸 수 있는 용량. 보통은 장당 한도 그대로다 */
export function perImageBudget(count: number, total: number = SAFE_REQUEST_BYTES): number {
  return Math.min(MAX_IMAGE_BYTES, Math.floor(total / Math.max(1, count)));
}

/** 서버가 한 요청에 받는 장수만큼 끊는다 */
export function chunkForUpload<T>(items: T[], size: number = MAX_IMAGES_PER_REQUEST): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

/**
 * JPEG·HEIC·WEBP 는 EXIF(촬영 위치)를 지우려고 항상 다시 그린다. PNG 는 한도를 넘을 때만(투명도 보존).
 * 서버가 받지 않는 형식(GIF·BMP·AVIF 등)은 작아도 JPEG 로 바꿔야 올라간다.
 */
export function needsShrink(type: string, size: number, maxBytes: number): boolean {
  return shouldReencodeImage(type) || !isUploadableType(type) || size > maxBytes;
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
 * 브라우저가 열 수 없는 사진은 서버가 받는 형식이고 한도 안일 때만 원본을 그대로 보낸다.
 * 서버가 받지 않는 형식(예: 크롬의 HEIC)이면 `image_unsupported`, 너무 크면 `image_too_large` 를 던진다.
 */
export async function prepareImageForUpload(
  file: File,
  { maxEdge = DEFAULT_MAX_EDGE, maxBytes = MAX_IMAGE_BYTES } = {}
): Promise<File> {
  if (typeof document === 'undefined') return file;
  if (!needsShrink(file.type, file.size, maxBytes)) return file;

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    if (!isUploadableType(file.type)) throw new Error('image_unsupported');
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
  if (isUploadableType(file.type) && file.size <= maxBytes) return file;
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

export function isImageUnsupported(err: unknown): boolean {
  return err instanceof Error && err.message === 'image_unsupported';
}

/** 사진 업로드 실패 안내. 형식·용량·네트워크만 따로 말하고 나머지는 화면이 준 기본 문구를 쓴다 */
export function photoUploadErrorMessage(err: unknown, fallback: string): string {
  if (isImageUnsupported(err)) return '지원하지 않는 사진 형식이에요. JPG·PNG 사진으로 올려주세요.';
  if (isImageTooLarge(err)) return '사진 용량이 너무 커요. 다른 사진으로 시도해주세요.';
  const e = err as { isAxiosError?: boolean; response?: unknown } | null;
  if (e?.isAxiosError && e.response === undefined) return '네트워크 연결을 확인한 뒤 다시 시도해주세요.';
  return fallback;
}
