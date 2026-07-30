/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Tells Webpack to skip bundling these modern Node modules
    serverComponentsExternalPackages: ['cheerio', 'undici'],
  },
  async rewrites() {
    return [
      {
        source: '/proxy/megacloud/:path*',
        destination: 'https://megacloud.tv/:path*',
      }
    ];
  },
};

module.exports = nextConfig;