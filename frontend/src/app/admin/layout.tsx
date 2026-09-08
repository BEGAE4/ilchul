import type { Metadata } from 'next';
import AdminLayout from '@/widgets/admin-layout';
import { RequireAuth } from '@/features/authentication/components/RequireAuth';

export const metadata: Metadata = {
  title: '운영자 콘솔 — 일출',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 관리자(ROLE_ADMIN) 전용 — 비로그인은 /login, 일반 계정은 홈으로 보낸다
  return (
    <RequireAuth adminOnly>
      <AdminLayout>{children}</AdminLayout>
    </RequireAuth>
  );
}
