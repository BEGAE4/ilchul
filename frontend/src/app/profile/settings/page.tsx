import type { Metadata } from 'next';
import { SettingsPage } from '@/features/profile/components/SettingsPage';
import { RequireAuth } from '@/features/authentication/components/RequireAuth';
import PageLayout from '@/shared/ui/PageLayout';

export const metadata: Metadata = {
  title: '설정 · 일출',
};

export default function Settings() {
  return (
    <RequireAuth>
      <PageLayout>
        <SettingsPage />
      </PageLayout>
    </RequireAuth>
  );
}
