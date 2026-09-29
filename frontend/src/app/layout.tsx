import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "./providers";
import { AppShell } from "@/shared/ui/AppShell";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TITLE,
} from "@/shared/lib/constants/siteMeta";
import "./globals.css";

// 제목·설명·키워드에 서비스 키워드 "일단 출발" 을 넣는다 (shared/lib/constants/siteMeta)
export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME} ${SITE_TAGLINE}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
    title: SITE_NAME,
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
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
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
