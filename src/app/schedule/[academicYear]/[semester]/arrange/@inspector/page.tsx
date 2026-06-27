import { prisma } from "@/lib/prisma";
import { semester as semesterEnum } from "@/prisma/generated/client";
import InspectorClient from "./_components/InspectorClient";
import type { RequiredSubject } from "../_lib/arrange-progress";

export default async function InspectorSlot({
  params,
  searchParams,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
  searchParams: Promise<{ teacher?: string }>;
}) {
  const [{ academicYear, semester }, { teacher }] = await Promise.all([params, searchParams]);

  if (!teacher || !/^\d+$/.test(teacher)) {
    return null;
  }

  const sem = semester === "2" ? semesterEnum.SEMESTER_2 : semesterEnum.SEMESTER_1;
  const responsibilities = await prisma.teachers_responsibility.findMany({
    where: {
      TeacherID: parseInt(teacher, 10),
      AcademicYear: parseInt(academicYear, 10),
      Semester: sem,
    },
    include: { subject: { select: { SubjectCode: true, SubjectName: true } } },
  });

  const bySubject = new Map<string, RequiredSubject>();
  let requiredTotal = 0;
  for (const r of responsibilities) {
    const { SubjectCode, SubjectName } = r.subject;
    requiredTotal += r.TeachHour;
    const existing = bySubject.get(SubjectCode);
    if (existing) existing.requiredHours += r.TeachHour;
    else
      bySubject.set(SubjectCode, {
        SubjectCode,
        SubjectName,
        requiredHours: r.TeachHour,
      });
  }

  return (
    <InspectorClient
      required={[...bySubject.values()]}
      requiredTotal={requiredTotal}
    />
  );
}
