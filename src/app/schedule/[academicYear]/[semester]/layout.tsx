import { ReactNode } from "react";
import { redirect, notFound, forbidden } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { normalizeAppRole, isAdminRole } from "@/lib/authz";
import { semesterRepository } from "@/features/semester/infrastructure/repositories/semester.repository";

// NOTE: Cannot export segment configs (dynamic, runtime, etc.) in Next.js 16
// when using async params. The layout is already dynamic due to async params.

export default async function ScheduleSemesterLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ academicYear: string; semester: string }>;
}) {
  // Server-side authentication check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  // Admin-only access
  const userRole = normalizeAppRole(session.user?.role);
  if (!isAdminRole(userRole)) {
    forbidden();
  }

  const { academicYear, semester } = await params;

  // Parse and validate
  const year = parseInt(academicYear, 10);
  const sem = parseInt(semester, 10) as 1 | 2;

  // Validate format
  if (!sem || !Number.isFinite(year) || (sem !== 1 && sem !== 2)) {
    return redirect("/dashboard");
  }

  let exists: object | null = null;
  if (process.env.E2E_TEST_BYPASS_DB_CHECKS === "true") {
    // For E2E tests, bypass DB check for semester existence
    // Assumption: test setup guarantees semester exists
    exists = { ConfigID: `${sem}-${year}` }; // Mock a valid response
  } else {
    // Validate existence in DB (table_config)
    // Note: We allow unconfigured semesters - they exist in semester table but may not have timeslot config yet
    exists = await semesterRepository.findByYearAndSemester(year, sem);
  }

  if (!exists) {
    // Semester doesn't exist at all - show 404 not-found page
    notFound();
  }

  // Semester exists (configured or not) - allow access
  // Child pages will handle unconfigured state with helpful messages
  return <>{children}</>;
}
