import { InquiryPage } from '@/features/inquiry';
import { RequireAuth } from '@/features/authentication/components/RequireAuth';
import PageLayout from '@/shared/ui/PageLayout';

export default function InquiryRoute() {
  return (
    <RequireAuth>
      <PageLayout>
        <InquiryPage />
      </PageLayout>
    </RequireAuth>
  );
}
