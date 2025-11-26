import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 코스 목록 조회 API
  return NextResponse.json({ courses: [] });
}

export async function POST(request: NextRequest) {
  // 코스 생성 API
  const body = await request.json();
  return NextResponse.json({ success: true, course: body });
}
