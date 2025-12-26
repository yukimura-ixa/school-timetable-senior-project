import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { sortTimeslots } from "@/features/timeslot/domain/services/timeslot.service";
import { timeslotRepository } from "@/features/timeslot/infrastructure/repositories/timeslot.repository";
import { findSummary } from "@/features/class/infrastructure/repositories/class.repository";
import { teacherRepository } from "@/features/teacher/infrastructure/repositories/teacher.repository";
import type { semester } from "@/prisma/generated/client";
import { headers } from "next/headers";
import AllTimeslotClient from "./AllTimeslotClient";

type PageParams = Promise<{ academicYear: string; semester: string }>;

export default async function AllTimeslotPage({
  params,
}: {
  params: PageParams;
}) {
  const headerList = await headers();
  const { academicYear: yearStr, semester: semStr } = await params;
  const year = parseInt(yearStr, 10);
  const semester = parseInt(semStr, 10) as 1 | 2;
  const semesterEnum = `SEMESTER_${semester}` as semester;

  const [timeslots, classSchedules, teachers, session] = await Promise.all([
    timeslotRepository.findByTerm(year, semesterEnum),
    findSummary(year, semesterEnum),
    teacherRepository.findAll(),
    auth.api.getSession({
      headers: headerList,
      asResponse: false,
    }),
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
      configManageHref={`/schedule/${year}/${semester}/config`}
    />
  );
}
