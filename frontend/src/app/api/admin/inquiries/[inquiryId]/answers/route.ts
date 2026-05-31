import { NextRequest, NextResponse } from 'next/server';
import { createMockInquiryAnswer } from '../../_mock';

interface RouteContext {
  params: Promise<{ inquiryId: string }>;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { inquiryId } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (baseUrl) {
    const cookie = req.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/admin/inquiries/${inquiryId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }
  if (typeof body?.body !== 'string' || body.body.trim().length === 0) {
    return NextResponse.json({ error: 'body required' }, { status: 400 });
  }
  const closeAfter = body.closeAfter === true;
  const updated = createMockInquiryAnswer(inquiryId, body.body.trim(), closeAfter);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(updated, { status: 201 });
}
