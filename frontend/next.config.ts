import type { NextConfig } from "next";

// NEXT_PUBLIC_API_BASE_URL 의 호스트와 NEXT_PUBLIC_IMAGE_HOSTS(쉼표 구분)를 remotePatterns 로 변환한다.
// S3 공개 URL(STORAGE_PUBLIC_URL) 은 백엔드 환경변수라 프론트가 알 수 없으므로 배포 환경에서 지정한다.
function envImageHosts(): { protocol: 'http' | 'https'; hostname: string; port?: string }[] {
  const out: { protocol: 'http' | 'https'; hostname: string; port?: string }[] = [];
  const push = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    try {
      const u = new URL(v.includes('://') ? v : `https://${v}`);
      out.push({
        protocol: u.protocol === 'http:' ? 'http' : 'https',
        hostname: u.hostname,
        ...(u.port ? { port: u.port } : {}),
      });
    } catch {
      /* 잘못된 값은 무시 */
    }
  };
  push(process.env.NEXT_PUBLIC_API_BASE_URL ?? '');
  (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? '').split(',').forEach(push);
  return out;
}

const nextConfig: NextConfig = {
  eslint: {
    // 빌드 시 ESLint 오류가 있어도 빌드를 끝까지 완료함
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  images: {
    // next/image 는 remotePatterns 에 없는 호스트를 /_next/image 에서 400 으로 거절한다.
    // 서버 응답의 이미지 출처를 모두 등록한다:
    //  - 장소 사진: Google Places (lh3.googleusercontent.com)
    //  - 프로필: 카카오/구글 OAuth CDN
    //  - 플랜/스탬프 이미지: S3 (STORAGE_PUBLIC_URL, 배포마다 다름) → NEXT_PUBLIC_IMAGE_HOSTS 로 추가 등록
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3845' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.kakaocdn.net' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      ...envImageHosts(),
    ],
  },
  output: "standalone",
};

export default nextConfig;