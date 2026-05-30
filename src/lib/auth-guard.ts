import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";

/**
 * Admin authorization guard for server actions.
 *
 * Returns an error result when the caller has no session (`Unauthorized`) or
 * is authenticated but lacks the admin role (`Forbidden`); returns `null` when
 * access is granted.
 *
 * The proxy middleware (`src/proxy.ts`) only verifies session-cookie *presence*
 * (optimistic, no DB call), so role enforcement must happen at the action
 * boundary — any logged-in user clears the middleware regardless of role.
 */
export async function requireAdminAccess(): Promise<{
  success: false;
  error: string;
} | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { success: false, error: "Unauthorized" };

  const role = normalizeAppRole(session.user?.role);
  if (!isAdminRole(role)) return { success: false, error: "Forbidden" };

  return null;
}
