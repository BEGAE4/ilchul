import type { Metadata } from 'next';
import { SettingsPage } from '@/features/profile/components/SettingsPage';
import PageLayout from '@/shared/ui/PageLayout';

export const metadata: Metadata = {
  title: '설정 · 일출',
};

export default function Settings() {
  return (
    <PageLayout>
      <SettingsPage />
    </PageLayout>
  );
}
