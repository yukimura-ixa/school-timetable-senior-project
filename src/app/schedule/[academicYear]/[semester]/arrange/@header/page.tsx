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
  searchParams: Promise<{ teacher?: string }>;
}) {
  const { academicYear, semester } = await params;
  const { teacher } = await searchParams;

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

  return (
    <HeaderClient
      teachers={teachers}
      selectedTeacher={teacher}
      academicYear={academicYear}
      semester={semester}
    />
  );
}
