import { NextRequest, NextResponse } from 'next/server';
import type {
  AdminReportListItem,
  AdminReportListResponse,
} from '@/features/admin-report/types/adminReport';
// 서버 라우트는 @/features/report 배럴(클라이언트 훅 포함)을 우회하기 위해 타입 파일에서 직접 가져온다.
import { REASON_LABELS } from '@/features/report/types/report';
import type {
  ReportReasonCode,
  ReportStatus,
  ReportTargetType,
} from '@/features/report/types/report';
import { getMockReports } from './_mock';

const DEFAULT_SIZE = 20;

function parseStatus(raw: string | null): ReportStatus | null {
  const allowed: ReportStatus[] = ['PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED'];
  return raw && (allowed as string[]).includes(raw) ? (raw as ReportStatus) : null;
}

function parseTargetType(raw: string | null): ReportTargetType | null {
  const allowed: ReportTargetType[] = ['course', 'comment', 'user'];
  return raw && (allowed as string[]).includes(raw) ? (raw as ReportTargetType) : null;
}

function parseReasonCode(raw: string | null): ReportReasonCode | null {
  return raw && raw in REASON_LABELS ? (raw as ReportReasonCode) : null;
}

function matchesKeyword(row: AdminReportListItem, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const haystack: string[] = [row.reporterNickname, REASON_LABELS[row.reasonCode]];
  if (row.target.type === 'course') haystack.push(row.target.title, row.target.ownerId);
  if (row.target.type === 'comment') haystack.push(row.target.snippet, row.target.ownerId);
  if (row.target.type === 'user') haystack.push(row.target.nickname);
  return haystack.some((s) => s.toLowerCase().includes(needle));
}

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const sp = req.nextUrl.searchParams;

  if (baseUrl) {
    const cookie = req.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/admin/reports?${sp.toString()}`, {
      headers: { ...(cookie ? { cookie } : {}) },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  // mock
  let rows = getMockReports();

  const status = parseStatus(sp.get('status'));
  if (status) rows = rows.filter((r) => r.status === status);

  const targetType = parseTargetType(sp.get('targetType'));
  if (targetType) rows = rows.filter((r) => r.target.type === targetType);

  const reasonCode = parseReasonCode(sp.get('reasonCode'));
  if (reasonCode) rows = rows.filter((r) => r.reasonCode === reasonCode);

  if (sp.get('autoBlindedOnly') === 'true') {
    rows = rows.filter((r) => r.autoBlinded);
  }

  const q = sp.get('q');
  if (q && q.trim()) rows = rows.filter((r) => matchesKeyword(r, q));

  const sort = sp.get('sort') ?? 'createdAt:desc';
  rows = [...rows].sort((a, b) => {
    if (sort === 'reportCount:desc') return b.reportCount - a.reportCount;
    const at = new Date(a.createdAt).getTime();
    const bt = new Date(b.createdAt).getTime();
    return sort === 'createdAt:asc' ? at - bt : bt - at;
  });

  const totalCount = rows.length;
  const size = Math.max(1, Math.min(100, Number(sp.get('size')) || DEFAULT_SIZE));
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const start = (page - 1) * size;
  const slice = rows.slice(start, start + size);

  const body: AdminReportListResponse = {
    data: slice,
    totalCount,
    page,
    size,
    hasNext: start + size < totalCount,
  };
  return NextResponse.json(body);
}
