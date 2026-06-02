import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { sortTimeslots } from "@/features/timeslot/domain/services/timeslot.service";
import { timeslotRepository } from "@/features/timeslot/infrastructure/repositories/timeslot.repository";
import { findSummary } from "@/features/class/infrastructure/repositories/class.repository";
import { teacherRepository } from "@/features/teacher/infrastructure/repositories/teacher.repository";
import type { semester } from "@/prisma/generated/client";
import { headers } from "next/headers";
import AllTimeslotClient from "./AllTimeslotClient";
import { findByTerm as findConfigByTerm } from "@/features/config/infrastructure/repositories/config.repository";
import { parseConfigData } from "@/features/config/domain/types/config-data.types";

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

  const [timeslots, classSchedules, teachers, session, termConfig] =
    await Promise.all([
      timeslotRepository.findByTerm(year, semesterEnum),
      findSummary(year, semesterEnum),
      teacherRepository.findAll(),
      auth.api.getSession({
        headers: headerList,
        asResponse: false,
      }),
      findConfigByTerm(year, semesterEnum),
    ]);

  let slots: import("@/features/timeslot/domain/models/break.types").SlotConfig[] = [];
  try {
    slots = termConfig?.Config ? parseConfigData(termConfig.Config).slots : [];
  } catch {
    slots = [];
  }

  const isAdmin = isAdminRole(normalizeAppRole(session?.user?.role));

  return (
    <AllTimeslotClient
      timeslots={sortTimeslots(timeslots)}
      classSchedules={classSchedules}
      teachers={teachers}
      semester={semester}
      academicYear={year}
      isAdmin={isAdmin}
      configManageHref={`/dashboard`}
      slots={slots}
    />
  );
}
