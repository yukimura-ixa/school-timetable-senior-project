/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 optimizations
  reactCompiler: true,
  cacheComponents: true,

  // Allow custom distDir for parallel dev servers
  distDir: process.env.NEXT_DIST_DIR || ".next",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
