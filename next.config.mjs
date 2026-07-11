/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 optimizations
  reactCompiler: true,
  // cacheComponents: false — intentionally disabled while React Compiler cache
  // behaviour is being monitored in production. Re-enable once stable.
  cacheComponents: false,

  // Allow custom distDir for parallel dev servers
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // Headless-PDF deps stay unbundled (both are in Next's default external
  // list; kept explicit for the print routes' sake).
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  // @sparticuz/chromium unpacks brotli blobs from its bin/ dir with fs at
  // runtime, which output file tracing can't see — without this the prod
  // function 500s with "input directory .../bin does not exist". pnpm
  // symlinks packages, so trace the real .pnpm path as well.
  outputFileTracingIncludes: {
    "/print/**": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/node_modules/@sparticuz/chromium/bin/**",
    ],
  },

  experimental: {
    // Required for forbidden()/unauthorized() used by the admin role gates
    // (dashboard/management layouts). Without it forbidden() throws an
    // unhandled error instead of returning 403.
    authInterrupts: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-eval' is required by Next.js React Compiler in dev and by MUI Emotion SSR
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://*.googleusercontent.com",
              "font-src 'self'",
              "connect-src 'self' https://vitals.vercel-insights.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
