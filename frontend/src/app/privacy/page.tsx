import type { Metadata } from 'next';
import PageLayout from '@/shared/ui/PageLayout';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { PRIVACY_POLICY } from '@/features/legal/constants/privacyPolicy';

export const metadata: Metadata = {
  title: '개인정보처리방침 · 일출',
};

// 로그인 전에도 읽을 수 있어야 해서 RequireAuth 로 감싸지 않는다
export default function PrivacyRoute() {
  return (
    <PageLayout>
      <LegalDocumentPage document={PRIVACY_POLICY} />
    </PageLayout>
  );
}
