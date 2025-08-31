import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 启用静态导出用于Cloudflare Pages
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // 优化性能
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;
