import type { Metadata } from 'next';
import PageLayout from '@/shared/ui/PageLayout';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { TERMS_OF_SERVICE } from '@/features/legal/constants/termsOfService';

export const metadata: Metadata = {
  title: '이용약관 · 일출',
};

// 로그인 전에도 읽을 수 있어야 해서 RequireAuth 로 감싸지 않는다
export default function TermsRoute() {
  return (
    <PageLayout>
      <LegalDocumentPage document={TERMS_OF_SERVICE} />
    </PageLayout>
  );
}
