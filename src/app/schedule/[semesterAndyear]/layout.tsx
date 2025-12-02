import { ReactNode } from "react";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { semesterRepository } from "@/features/semester/infrastructure/repositories/semester.repository";

// NOTE: Cannot export segment configs (dynamic, runtime, etc.) in Next.js 16
// when using async params. The layout is already dynamic due to async params.

function parseParam(param: string): {
  semester: 1 | 2 | null;
  year: number | null;
  label: string;
} {
  const [semStr, yearStr] = (param || "").split("-");
  const semNum = Number(semStr);
  const yearNum = Number(yearStr);
  const validSem: 1 | 2 | null = semNum === 1 ? 1 : semNum === 2 ? 2 : null;
  const validYear = Number.isInteger(yearNum) ? yearNum : null;
  return { semester: validSem, year: validYear, label: `${semStr}-${yearStr}` };
}

export default async function ScheduleSemesterLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ semesterAndyear: string }>;
}) {
  // Server-side authentication check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const { semesterAndyear } = await params;
  const { semester, year } = parseParam(semesterAndyear);

  // Validate format
  if (!semester || !year) {
    return redirect("/dashboard");
  }

  // Validate existence in DB (table_config)
  // Note: We allow unconfigured semesters - they exist in semester table but may not have timeslot config yet
  const exists = await semesterRepository.findByYearAndSemester(year, semester);

  if (!exists) {
    // Semester doesn't exist at all - show 404 not-found page
    notFound();
  }

  // Semester exists (configured or not) - allow access
  // Child pages will handle unconfigured state with helpful messages
  return <>{children}</>;
}
