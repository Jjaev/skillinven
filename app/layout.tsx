import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "스킬인벤",
  description: "한국형 Claude Code Skills 마켓플레이스 MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
