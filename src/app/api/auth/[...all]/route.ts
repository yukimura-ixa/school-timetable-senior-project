import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Export all HTTP methods supported by better-auth
// Required for Next.js 16 to properly register all auth routes
// Source: https://www.better-auth.com/docs/plugins/scim
export const runtime = "nodejs"; // Better-auth requires Node.js runtime

export const { GET, POST, PUT, PATCH, DELETE } = toNextJsHandler(auth);
