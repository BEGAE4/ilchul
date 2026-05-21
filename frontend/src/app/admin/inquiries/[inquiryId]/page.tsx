import { Suspense } from 'react';
import { AdminInquiryDetailContent } from '@/features/admin-inquiry';

interface PageProps {
  params: Promise<{ inquiryId: string }>;
}

function DetailFallback() {
  return (
    <div className="space-y-3">
      <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 h-40 bg-gray-100 rounded animate-pulse" />
        <div className="h-40 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default async function AdminInquiryDetailPage({ params }: PageProps) {
  const { inquiryId } = await params;
  return (
    <Suspense fallback={<DetailFallback />}>
      <AdminInquiryDetailContent inquiryId={inquiryId} />
    </Suspense>
  );
}
