import { ReportDetailPage } from '@/features/report/components/ReportDetailPage';

interface Props {
  params: Promise<{ reportId: string }>;
}

export default async function Page({ params }: Props) {
  const { reportId } = await params;
  return <ReportDetailPage reportId={reportId} />;
}
