import { NextRequest, NextResponse } from 'next/server';

// 프론트에서 호출하는 공개/비공개 토글을 백엔드로 프록시합니다.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { status: 500, error: 'NEXT_PUBLIC_API_BASE_URL 설정이 필요합니다.' },
      { status: 500 }
    );
  }

  const { planId } = await params;
  const cookie = request.headers.get('cookie') ?? '';

  try {
    const res = await fetch(
      `${baseUrl}/api/mypage/plan/visibility/${planId}`,
      {
        method: 'POST',
        headers: cookie ? { cookie } : undefined,
      }
    );
    const data = await res.json().catch(() => ({ status: res.status }));

    if (!res.ok) {
      return NextResponse.json({ ...data, status: res.status }, { status: res.status });
    }

    return NextResponse.json({ status: data.status ?? res.status });
  } catch (error) {
    console.error('플랜 공개여부 설정 실패:', error);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
}

