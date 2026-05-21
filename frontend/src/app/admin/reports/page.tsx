import { Suspense } from 'react';
import { AdminReportsContent } from '@/features/admin-report';

function ReportsFallback() {
  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">신고</h2>
        <p className="mt-1 text-sm text-gray-600">불러오는 중...</p>
      </header>
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<ReportsFallback />}>
      <AdminReportsContent />
    </Suspense>
  );
}
