import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Dashboard Layout - Server Component
 *
 * Protects all dashboard routes with server-side authentication.
 * Redirects unauthenticated users to the signin page.
 */
export default async function DashboardLayout({
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
