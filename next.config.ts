import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tiptap/react",
      "@tiptap/core",
      "@tiptap/pm",
    ],
  },
  serverExternalPackages: ["yjs"],
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      yjs: path.resolve(process.cwd(), "node_modules/yjs"),
    };
    return config;
  },
  turbopack: {},
};

export default nextConfig;
