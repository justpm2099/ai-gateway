import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "AI Gateway 管理中心",
  description: "AI Gateway 管理中心 - 统一管理AI资源和用户",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://ai-gateway.aibook2099.workers.dev" />
        <link rel="dns-prefetch" href="https://ai-gateway.aibook2099.workers.dev" />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
