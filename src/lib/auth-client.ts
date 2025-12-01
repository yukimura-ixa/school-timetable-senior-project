/**
 * Better Auth Client
 *
 * Client-side authentication functions for React components
 * Uses better-auth/react for session management and authentication flows
 * Includes admin plugin for user management operations
 */

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : "http://localhost:3000"),
  plugins: [adminClient()],
});
