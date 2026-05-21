import { NextRequest, NextResponse } from 'next/server';
import { applyMockSanction } from '../../_mock';

const VALID_TYPES = ['WARNING', 'CONTENT_BLINDED', 'TEMP_BAN', 'PERMANENT_BAN'] as const;
const VALID_RESOLUTIONS = ['BLINDED', 'WARNED', 'BANNED', 'NO_ACTION'] as const;

interface RouteContext {
  params: Promise<{ reportId: string }>;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { reportId } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (baseUrl) {
    const cookie = req.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/admin/reports/${reportId}/sanctions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  if (!body?.type || !(VALID_TYPES as readonly string[]).includes(body.type)) {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  }
  if (!body?.resolution || !(VALID_RESOLUTIONS as readonly string[]).includes(body.resolution)) {
    return NextResponse.json({ error: 'invalid resolution' }, { status: 400 });
  }
  if (typeof body.message !== 'string' || body.message.trim().length === 0) {
    return NextResponse.json({ error: 'message required' }, { status: 400 });
  }

  const result = applyMockSanction(reportId, {
    type: body.type,
    durationDays: typeof body.durationDays === 'number' ? body.durationDays : undefined,
    message: body.message.trim(),
    resolution: body.resolution,
  });
  if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(result, { status: 201 });
}
