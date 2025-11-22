import { authWithDevBypass } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { sortTimeslots } from "@/features/timeslot/domain/services/timeslot.service";
import { timeslotRepository } from "@/features/timeslot/infrastructure/repositories/timeslot.repository";
import { findSummary } from "@/features/class/infrastructure/repositories/class.repository";
import { teacherRepository } from "@/features/teacher/infrastructure/repositories/teacher.repository";
import type { semester } from '@/prisma/generated/client';;
import AllTimeslotClient from "./AllTimeslotClient";



type PageParams = Promise<{ semesterAndyear: string }>;

const parseSemesterParam = (
  param: string
): { semester: 1 | 2; year: number } => {
  const [semStr, yearStr] = (param || "").split("-");
  const semesterNum = Number(semStr);
  const yearNum = Number(yearStr);

  if ((semesterNum !== 1 && semesterNum !== 2) || !Number.isInteger(yearNum)) {
    throw new Error("Invalid semester path segment");
  }

  return { semester: semesterNum as 1 | 2, year: yearNum };
};

export default async function AllTimeslotPage({ params }: { params: PageParams }) {
  const { semesterAndyear } = await params;
  const { semester, year } = parseSemesterParam(semesterAndyear);
  const semesterEnum = `SEMESTER_${semester}` as semester;

  const [timeslots, classSchedules, teachers, session] = await Promise.all([
    timeslotRepository.findByTerm(year, semesterEnum),
    findSummary(year, semesterEnum),
    teacherRepository.findAll(),
    authWithDevBypass(),
  ]);

  const isAdmin = isAdminRole(normalizeAppRole(session?.user?.role));

  return (
    <AllTimeslotClient
      timeslots={sortTimeslots(timeslots)}
      classSchedules={classSchedules}
      teachers={teachers}
      semester={semester}
      academicYear={year}
      isAdmin={isAdmin}
      configManageHref={`/schedule/${semesterAndyear}/config`}
    />
  );
}
