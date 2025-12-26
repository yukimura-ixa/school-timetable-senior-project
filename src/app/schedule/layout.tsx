import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Schedule Layout - Server Component
 *
 * Protects all schedule routes with server-side authentication.
 * Redirects unauthenticated users to the signin page.
 *
 * Note: Semester-specific schedule pages have additional validation
 * in their nested layout (schedule/[academicYear]/[semester]/layout.tsx)
 */
export default async function ScheduleLayout({
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
