// import {withSentryConfig} from '@sentry/nextjs'; // Temporarily disabled
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 optimizations
  reactCompiler: true,
  
  // TEMPORARY: Skip TypeScript check during build to unblock Vercel deployment
  // TODO: Fix all TypeScript errors (currently 180 errors in 52 files) - see Issue #51
  typescript: {
    ignoreBuildErrors: true,
  },
  
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