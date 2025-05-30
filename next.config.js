// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your other Next.js configurations can go here
  reactStrictMode: true, // Example other config

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. It's best to fix the errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
