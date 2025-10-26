/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 optimizations
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'recharts',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
    ],
  },
};

export default nextConfig;
