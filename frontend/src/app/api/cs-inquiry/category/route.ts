import { NextRequest, NextResponse } from 'next/server';

const CATEGORIES = [
  { slug: 'GENERAL', name: '일반' },
  { slug: 'BUG', name: '버그' },
  { slug: 'SUGGESTION', name: '제안' },
  { slug: 'OTHER', name: '기타' },
];

/** GET 문의 카테고리(타입) 목록 조회 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ categories: CATEGORIES });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/category`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ categories: CATEGORIES });
  }

  const data = await res.json().catch(() => ({ categories: CATEGORIES }));
  return NextResponse.json(data);
}
