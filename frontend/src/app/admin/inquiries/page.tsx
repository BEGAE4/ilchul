import { Suspense } from 'react';
import { AdminInquiriesContent } from '@/features/admin-inquiry';

function InquiriesFallback() {
  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">문의</h2>
        <p className="mt-1 text-sm text-gray-600">불러오는 중...</p>
      </header>
    </div>
  );
}

export default function AdminInquiriesPage() {
  return (
    <Suspense fallback={<InquiriesFallback />}>
      <AdminInquiriesContent />
    </Suspense>
  );
}
