import { ReactNode } from "react";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { semesterRepository } from "@/features/semester/infrastructure/repositories/semester.repository";

// NOTE: Cannot export segment configs (dynamic, runtime, etc.) in Next.js 16
// when using async params. The layout is already dynamic due to async params.

export default async function DashboardSemesterLayout({
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

  const { academicYear: academicYearStr, semester: semesterStr } = await params;

  // Parse and validate
  const year = parseInt(academicYearStr, 10);
  const semNum = parseInt(semesterStr, 10);
  const semester: 1 | 2 | null = semNum === 1 ? 1 : semNum === 2 ? 2 : null;

  // Validate format
  if (!semester || !Number.isFinite(year)) {
    return redirect("/dashboard");
  }

  // Validate existence in DB (table_config)
  const exists = await semesterRepository.findByYearAndSemester(year, semester);

  if (!exists) {
    // Semester doesn't exist - show 404 not-found page
    notFound();
  }

  return <>{children}</>;
}
