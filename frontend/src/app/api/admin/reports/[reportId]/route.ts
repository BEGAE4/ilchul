import { NextRequest, NextResponse } from 'next/server';
import {
  getMockReportDetail,
  updateMockReportStatus,
} from '../_mock';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

interface RouteContext {
  params: Promise<{ reportId: string }>;
}

async function proxyToBackend(req: NextRequest, reportId: string, method: 'GET' | 'PATCH'): Promise<Response | null> {
  if (useMock) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const cookie = req.headers.get('cookie') ?? '';
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
  };
  if (method !== 'GET') {
    init.body = JSON.stringify(await req.json());
  }
  return fetch(`${baseUrl}/api/admin/reports/${reportId}`, init);
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { reportId } = await ctx.params;
  const proxied = await proxyToBackend(req, reportId, 'GET');
  if (proxied) {
    const data = await proxied.json().catch(() => ({}));
    return NextResponse.json(data, { status: proxied.status });
  }
  const detail = getMockReportDetail(reportId);
  if (!detail) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(detail);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { reportId } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  if (!useMock) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const cookie = req.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }
  const allowed = ['REVIEWING', 'REJECTED'];
  if (!body?.status || !allowed.includes(body.status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }
  const updated = updateMockReportStatus(
    reportId,
    body.status,
    'operator:admin',
    typeof body.note === 'string' ? body.note : undefined,
  );
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(updated);
}
