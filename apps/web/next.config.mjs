/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
  async rewrites() {
    const apiUrl = process.env.API_PROXY_URL?.replace(/\/$/, "")
      ?? (process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
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
