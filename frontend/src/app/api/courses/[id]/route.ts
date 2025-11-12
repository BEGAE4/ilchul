import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // 특정 코스 조회 API
  return NextResponse.json({ course: { id: params.id } });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  // 코스 수정 API
  const body = await request.json();
  return NextResponse.json({ success: true, course: { id: params.id, ...body } });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // 코스 삭제 API
  return NextResponse.json({ success: true });
}
