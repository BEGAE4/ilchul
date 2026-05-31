import { NextRequest, NextResponse } from 'next/server';
import {
  deleteMockInquiryAnswer,
  updateMockInquiryAnswer,
} from '../../../_mock';

interface RouteContext {
  params: Promise<{ inquiryId: string; answerId: string }>;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { inquiryId, answerId } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (baseUrl) {
    const cookie = req.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/admin/inquiries/${inquiryId}/answers/${answerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }
  if (typeof body?.body !== 'string' || body.body.trim().length === 0) {
    return NextResponse.json({ error: 'body required' }, { status: 400 });
  }
  const updated = updateMockInquiryAnswer(inquiryId, answerId, body.body.trim());
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { inquiryId, answerId } = await ctx.params;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (baseUrl) {
    const cookie = req.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/admin/inquiries/${inquiryId}/answers/${answerId}`, {
      method: 'DELETE',
      headers: { ...(cookie ? { cookie } : {}) },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }
  const updated = deleteMockInquiryAnswer(inquiryId, answerId);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(updated);
}
