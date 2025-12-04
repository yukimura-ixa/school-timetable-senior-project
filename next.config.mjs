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
};

export default nextConfig;

