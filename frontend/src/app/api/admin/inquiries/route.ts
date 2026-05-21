import { NextRequest, NextResponse } from 'next/server';
import type {
  AdminInquiryListItem,
  AdminInquiryListResponse,
  InquiryCategory,
  InquiryStatus,
} from '@/features/admin-inquiry/types/adminInquiry';
import { getMockInquiries } from './_mock';

const DEFAULT_SIZE = 20;

function parseStatus(raw: string | null): InquiryStatus | null {
  const allowed: InquiryStatus[] = ['OPEN', 'ANSWERED', 'CLOSED'];
  return raw && (allowed as string[]).includes(raw) ? (raw as InquiryStatus) : null;
}

function parseCategory(raw: string | null): InquiryCategory | null {
  const allowed: InquiryCategory[] = [
    'ACCOUNT',
    'CONTENT',
    'REPORT_APPEAL',
    'BUG',
    'FEATURE',
    'ETC',
  ];
  return raw && (allowed as string[]).includes(raw) ? (raw as InquiryCategory) : null;
}

function matchesKeyword(row: AdminInquiryListItem, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    row.title.toLowerCase().includes(needle) ||
    row.author.nickname.toLowerCase().includes(needle)
  );
}

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const sp = req.nextUrl.searchParams;

  if (baseUrl) {
    const cookie = req.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/admin/inquiries?${sp.toString()}`, {
      headers: { ...(cookie ? { cookie } : {}) },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  let rows = getMockInquiries();

  const status = parseStatus(sp.get('status'));
  if (status) rows = rows.filter((r) => r.status === status);

  const category = parseCategory(sp.get('category'));
  if (category) rows = rows.filter((r) => r.category === category);

  const q = sp.get('q');
  if (q && q.trim()) rows = rows.filter((r) => matchesKeyword(r, q));

  const sort = sp.get('sort') ?? 'createdAt:desc';
  rows = [...rows].sort((a, b) => {
    if (sort === 'updatedAt:desc') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalCount = rows.length;
  const size = Math.max(1, Math.min(100, Number(sp.get('size')) || DEFAULT_SIZE));
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const start = (page - 1) * size;
  const slice = rows.slice(start, start + size);

  const body: AdminInquiryListResponse = {
    data: slice,
    totalCount,
    page,
    size,
    hasNext: start + size < totalCount,
  };
  return NextResponse.json(body);
}
