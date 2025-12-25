/**
 * Header Slot - Server Component
 *
 * Fetches teachers and grade levels server-side, passes to client components.
 * No SWR needed here - direct Prisma queries in Server Component.
 */

import { prisma } from "@/lib/prisma";
import { HeaderClient } from "./_components/HeaderClient";

export default async function HeaderSlot({
  params,
  searchParams,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
  searchParams: Promise<{ teacher?: string; tab?: string }>;
}) {
  const { academicYear, semester } = await params;
  const { teacher, tab = "teacher" } = await searchParams;

  // SERVER-SIDE: Fetch teachers (no SWR, no Server Action)
  const teachers = await prisma.teacher.findMany({
    orderBy: [{ Firstname: "asc" }, { Lastname: "asc" }],
    select: {
      TeacherID: true,
      Prefix: true,
      Firstname: true,
      Lastname: true,
      Department: true,
      Role: true,
    },
  });

  // SERVER-SIDE: Fetch grade levels for tabs
  const gradeLevels = await prisma.gradelevel.findMany({
    orderBy: [{ Year: "asc" }, { Number: "asc" }],
    select: {
      GradeID: true,
      Year: true,
      Number: true,
      GradeName: true,
    },
  });

  // Count classes per grade for tab badges
  const gradeCounts: Record<number, number> = {};
  gradeLevels.forEach((g) => {
    gradeCounts[g.Year] = (gradeCounts[g.Year] || 0) + 1;
  });

  return (
    <HeaderClient
      teachers={teachers}
      gradeLevels={gradeLevels}
      gradeCounts={gradeCounts}
      selectedTeacher={teacher}
      currentTab={tab}
      academicYear={academicYear}
      semester={semester}
    />
  );
}
