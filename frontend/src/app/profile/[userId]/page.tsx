import { UserProfilePage } from '@/features/profile/components/UserProfilePage';
import PageLayout from '@/shared/ui/PageLayout';

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserProfile({ params }: Props) {
  const { userId } = await params;
  return (
    <PageLayout>
      <UserProfilePage userId={userId} />
    </PageLayout>
  );
}
