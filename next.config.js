/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Vercel's Webpack to skip bundling these troublesome Node modules
  experimental: {
    serverComponentsExternalPackages: ['cheerio', 'undici'],
  },
  // Keep any existing config you already had below (like rewrites, images, etc.)
};

module.exports = nextConfig;