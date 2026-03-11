import { MagazineDetailPage } from '@/features/magazine/components/MagazineDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MagazinePage({ params }: PageProps) {
  const { id } = await params;
  return <MagazineDetailPage magazineId={id} />;
}
