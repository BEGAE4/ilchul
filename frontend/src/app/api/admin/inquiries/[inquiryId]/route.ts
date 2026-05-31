import { NextRequest, NextResponse } from 'next/server';
import {
  getMockInquiryDetail,
  updateMockInquiryStatus,
} from '../_mock';

const VALID_STATUSES = ['OPEN', 'ANSWERED', 'CLOSED'] as const;

interface RouteContext {
  params: Promise<{ inquiryId: string }>;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { inquiryId } = await ctx.params;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (baseUrl) {
    const cookie = req.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/admin/inquiries/${inquiryId}`, {
      headers: { ...(cookie ? { cookie } : {}) },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }
  const detail = getMockInquiryDetail(inquiryId);
  if (!detail) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(detail);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { inquiryId } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (baseUrl) {
    const cookie = req.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/admin/inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }
  if (!body?.status || !(VALID_STATUSES as readonly string[]).includes(body.status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }
  const updated = updateMockInquiryStatus(inquiryId, body.status);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(updated);
}
