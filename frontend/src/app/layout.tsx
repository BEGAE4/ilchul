import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "일출 - 맞춤형 당일치기 힐링 플래너",
  description: "맞춤형 당일치기 힐링 플래너",
  // favicon 교체 시 브라우저 캐시 무효화용 버전 쿼리 — 아이콘 변경 시 v를 올릴 것
  icons: {
    icon: "/favicon.ico?v=2",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "일출",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="mobile-optimized">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontSize: '14px' },
            duration: 2000,
          }}
        />
      </body>
    </html>
  );
}
