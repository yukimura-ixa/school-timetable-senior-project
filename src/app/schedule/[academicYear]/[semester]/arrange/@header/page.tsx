/**
 * Header Slot - Server Component
 *
 * Fetches teachers server-side, passes to client component. Grade tabs were
 * removed because schedule = teacher arrangement; read-only grade views live
 * in /dashboard/.../student-table.
 */

import { prisma } from "@/lib/prisma";
import { HeaderClient } from "./_components/HeaderClient";

export default async function HeaderSlot({
  params,
  searchParams,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
  searchParams: Promise<{ teacher?: string; grade?: string; view?: string }>;
}) {
  const { academicYear, semester } = await params;
  const { teacher, grade, view } = await searchParams;

  const [teachers, gradeRows] = await Promise.all([
    prisma.teacher.findMany({
      orderBy: [{ Firstname: "asc" }, { Lastname: "asc" }],
      select: {
        TeacherID: true,
        Prefix: true,
        Firstname: true,
        Lastname: true,
        Department: true,
        Role: true,
      },
    }),
    prisma.gradelevel.findMany({
      orderBy: [{ Year: "asc" }, { Number: "asc" }],
      select: { GradeID: true, Year: true, Number: true },
    }),
  ]);

  const grades = gradeRows.map((g) => ({
    GradeID: g.GradeID,
    GradeLabel: `ม.${g.Year}/${g.Number}`,
  }));

  return (
    <HeaderClient
      teachers={teachers}
      grades={grades}
      selectedTeacher={teacher}
      selectedGrade={grade}
      view={view}
      academicYear={academicYear}
      semester={semester}
    />
  );
}
