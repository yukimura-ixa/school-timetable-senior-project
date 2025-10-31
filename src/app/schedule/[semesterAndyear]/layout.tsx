import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { semesterRepository } from "@/features/semester/infrastructure/repositories/semester.repository";

export const dynamic = "force-dynamic"; // ensure fresh validation

function parseParam(param: string): { semester: 1 | 2 | null; year: number | null; label: string } {
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
  const { semesterAndyear } = await params;
  const { semester, year } = parseParam(semesterAndyear);

  // Validate format
  if (!semester || !year) {
    return redirect("/dashboard/select-semester");
  }

  // Validate existence in DB (table_config)
  // Note: We allow unconfigured semesters - they exist in semester table but may not have timeslot config yet
  const exists = await semesterRepository.findByYearAndSemester(year, semester);
  if (!exists) {
    // Semester doesn't exist at all - redirect to selection
    return redirect("/dashboard/select-semester");
  }

  // Semester exists (configured or not) - allow access
  // Child pages will handle unconfigured state with helpful messages
  return <>{children}</>;
}
