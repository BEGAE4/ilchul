import type { Metadata } from 'next';
import AdminLayout from '@/widgets/admin-layout';

export const metadata: Metadata = {
  title: '운영자 콘솔 — 일출',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
