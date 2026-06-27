import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTION_API_ORIGIN = "https://dropmart-7umo.onrender.com";

const isVercel = process.env.VERCEL === "1";
const productionApiBase = `${PRODUCTION_API_ORIGIN}/api/v1`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for npm workspaces — hoisted deps live in repo root node_modules.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["three"],
  env: {
    NEXT_PUBLIC_API_URL: isVercel
      ? process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
        ? process.env.NEXT_PUBLIC_API_URL
        : productionApiBase
      : (process.env.NEXT_PUBLIC_API_URL ?? "/api/v1"),
    NEXT_PUBLIC_WS_URL:
      process.env.NEXT_PUBLIC_WS_URL ?? (isVercel ? PRODUCTION_API_ORIGIN : undefined),
  },
  async rewrites() {
    const apiOrigin =
      process.env.API_PROXY_URL?.replace(/\/$/, "") ??
      (isVercel || process.env.NODE_ENV === "production"
        ? PRODUCTION_API_ORIGIN
        : "http://localhost:4000");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
