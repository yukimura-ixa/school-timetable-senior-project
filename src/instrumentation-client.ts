// This file configures the initialization of Sentry on the client.      
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://840503297d11183cd9e493807ce1840d@o4510285022035968.ingest.us.sentry.io/4510285047398400",

  // Add optional integrations for additional features
  integrations: [
    // Session replay disabled to reduce Sentry quota usage
    // Sentry.replayIntegration(),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Session replay disabled - sample rates set to 0
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Enable sending user PII (Personally Identifiable Information)       
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;