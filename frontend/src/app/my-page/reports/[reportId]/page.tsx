import { ReportDetailPage } from '@/features/report/components/ReportDetailPage';
import { RequireAuth } from '@/features/authentication/components/RequireAuth';

interface Props {
  params: Promise<{ reportId: string }>;
}

export default async function Page({ params }: Props) {
  const { reportId } = await params;
  return (
    <RequireAuth>
      <ReportDetailPage reportId={reportId} />
    </RequireAuth>
  );
}
