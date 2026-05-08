import { Suspense } from 'react';
import { LoginPage } from '@/features/authentication/components/LoginPage';

export default function LoginRoute() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
