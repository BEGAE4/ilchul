import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "일출 - 모바일 웹앱",
  description: "일출을 감상하고 기록하는 모바일 웹앱",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#000000",
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
        {children}
      </body>
    </html>
  );
}
