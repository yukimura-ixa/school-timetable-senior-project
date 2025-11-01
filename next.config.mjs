// import {withSentryConfig} from '@sentry/nextjs'; // Temporarily disabled
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 optimizations
  reactCompiler: true,
  
  // Exclude problematic packages from server bundling
  // These packages have broken package.json or version conflicts
  serverExternalPackages: [
    'rimraf',           // Used by fstream, tmp - has package.json issues
    'fstream',          // Old file streaming library
    'tmp',              // Temporary file library
    'import-in-the-middle',  // OpenTelemetry instrumentation
    'require-in-the-middle', // OpenTelemetry instrumentation (version conflict)
  ],
  
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

// Sentry configuration temporarily disabled for debugging
/*
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "yukimura-ixa",

  project: "phrasongsa-timetable",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

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
});
*/