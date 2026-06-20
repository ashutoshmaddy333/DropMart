import { PRODUCTION_API_ORIGIN } from "./config/production-api.js";

const isVercel = process.env.VERCEL === "1";
const productionApiBase = `${PRODUCTION_API_ORIGIN}/api/v1`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? (isVercel ? productionApiBase : "/api/v1"),
    NEXT_PUBLIC_WS_URL:
      process.env.NEXT_PUBLIC_WS_URL ?? (isVercel ? PRODUCTION_API_ORIGIN : undefined),
  },
  async rewrites() {
    const apiUrl =
      process.env.API_PROXY_URL?.replace(/\/$/, "") ??
      (process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
        : isVercel
          ? PRODUCTION_API_ORIGIN
          : "http://localhost:4000");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
