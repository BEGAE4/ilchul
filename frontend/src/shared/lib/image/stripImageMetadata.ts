// 업로드 전에 사진을 다시 인코딩해 EXIF(촬영 위치 GPS, 기기 정보 등) 메타데이터를 지운다.
// 방문 인증·여행 사진은 다른 이용자에게 보일 수 있는데, Android 등에서 찍은 원본에는 촬영 좌표가 남아 있다.
// 캔버스에 다시 그리면 픽셀만 남는다. 사진 방향(Orientation)은 브라우저가 디코딩할 때 이미 반영한다.

/** 다시 인코딩할 형식. PNG·GIF 는 투명도·애니메이션이 깨지고 촬영 메타데이터가 거의 없어 원본을 둔다 */
const REENCODE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/heic', 'image/heif', 'image/webp']);

/** iOS Safari 캔버스 최대 면적(약 16.7MP)을 넘지 않게 긴 변을 제한한다 — 48MP 원본을 그대로 그리면 빈 이미지가 된다 */
export const MAX_IMAGE_EDGE = 4096;
const JPEG_QUALITY = 0.9;

export function shouldReencodeImage(type: string): boolean {
  return REENCODE_TYPES.has(type.toLowerCase());
}

export function fitWithinEdge(
  width: number,
  height: number,
  maxEdge: number = MAX_IMAGE_EDGE
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function toJpegFileName(name: string): string {
  const base = name.replace(/\.[^./]+$/, '');
  return `${base || 'photo'}.jpg`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image_decode_failed'));
    };
    img.src = url;
  });
}

/**
 * 메타데이터를 지운 JPEG 사본을 돌려준다.
 * 디코딩할 수 없는 형식(예: 크롬의 HEIC)이거나 브라우저 밖이면 원본을 그대로 돌려준다 — 업로드 자체는 막지 않는다.
 */
export async function stripImageMetadata(file: File): Promise<File> {
  if (typeof document === 'undefined' || !shouldReencodeImage(file.type)) return file;

  try {
    const img = await loadImage(file);
    const { width, height } = fitWithinEdge(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    );
    if (!blob) return file;
    return new File([blob], toJpegFileName(file.name), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}

/** 여러 장은 차례로 처리한다 — 휴대폰에서 고해상도 사진을 동시에 디코딩하면 메모리가 부족해진다 */
export async function stripImagesMetadata(files: File[]): Promise<File[]> {
  const out: File[] = [];
  for (const file of files) {
    out.push(await stripImageMetadata(file));
  }
  return out;
}
