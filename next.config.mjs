import { withSentryConfig } from "@sentry/nextjs";

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

// Sentry configuration - only upload source maps when auth token is available
// This allows builds to succeed in CI/E2E environments without SENTRY_AUTH_TOKEN
const sentryConfig = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "yukimura-ixa",
  project: "phrasongsa-timetable",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Pass the auth token (required for source map uploads)
  // If not set, source maps won't be uploaded but build will still succeed
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,

  // Skip source map upload if no auth token is provided
  // This prevents build failures in CI/E2E environments
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
};

export default withSentryConfig(nextConfig, sentryConfig);
