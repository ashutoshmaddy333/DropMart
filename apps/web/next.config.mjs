/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
  async rewrites() {
    const apiUrl = process.env.API_PROXY_URL ?? "http://localhost:4000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
