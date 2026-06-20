const PRODUCTION_API_ORIGIN = "https://dropmart-7umo.onrender.com";

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
    // Local dev only — production calls Render API directly (no serverless proxy).
    if (isVercel || process.env.NODE_ENV === "production") {
      return [];
    }

    const apiUrl = process.env.API_PROXY_URL?.replace(/\/$/, "") ?? "http://localhost:4000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
