import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    categories: [
      { id: 'account', label: '계정' },
      { id: 'payment', label: '결제' },
      { id: 'bug', label: '오류/버그' },
      { id: 'feature', label: '기능 제안' },
      { id: 'content', label: '콘텐츠' },
      { id: 'other', label: '기타' },
    ],
  });
}
