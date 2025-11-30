import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Management Layout - Server Component
 *
 * Protects all management routes with server-side authentication.
 * Redirects unauthenticated users to the signin page.
 *
 * Note: Additional role-based checks are handled by middleware (proxy.ts)
 */
export default async function ManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side authentication check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return <>{children}</>;
}
