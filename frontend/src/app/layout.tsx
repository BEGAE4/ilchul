import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "일출 - 맞춤형 당일치기 힐링 플래너",
  description: "맞춤형 당일치기 힐링 플래너",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#000000",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="일출" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="mobile-optimized">
        <AuthProvider>{children}</AuthProvider>
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
