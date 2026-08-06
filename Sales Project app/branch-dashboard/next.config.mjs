/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Client-side auth guards mean we don't want lint to block production builds.
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
