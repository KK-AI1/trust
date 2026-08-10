import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRUST 店舗管理システム",
  description: "ラウンジ運営管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
