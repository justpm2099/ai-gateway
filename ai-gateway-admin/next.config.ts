import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 启用静态导出用于Cloudflare Pages
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
