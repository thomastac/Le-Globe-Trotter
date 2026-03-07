/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  swcMinify: true,
  output: 'standalone',
};

module.exports = nextConfig;
