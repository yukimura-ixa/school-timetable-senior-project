import { ReactNode } from "react";
import { redirect } from "next/navigation";
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

export default async function DashboardSemesterLayout({
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
  const exists = await semesterRepository.findByYearAndSemester(year, semester);

  if (!exists) {
    return redirect("/dashboard/select-semester");
  }

  return <>{children}</>;
}
