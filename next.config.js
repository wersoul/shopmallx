/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
  // Show full errors (helpful for Cloudflare Pages debugging — turn off in prod)
  productionBrowserSourceMaps: false
};
module.exports = nextConfig;