import React from "react";
import LockSchedule from "./component/LockSchedule";
import { getLockedSchedulesAction } from "@/features/lock/application/actions/lock.actions";
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service";

type Props = {
  params: Promise<{
    academicYear: string;
    semester: string;
  }>;
};

async function LockSchedulePage({ params }: Props) {
  const { academicYear: academicYearStr, semester: semesterStr } = await params;

  // Parse semester and academic year from route params
  const semester = parseInt(semesterStr, 10);
  const academicYear = parseInt(academicYearStr, 10);

  // Fetch data server-side
  let initialData: GroupedLockedSchedule[] = [];
  try {
    const result = await getLockedSchedulesAction({
      AcademicYear: academicYear,
      Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
    });
    initialData = result.success ? (result.data ?? []) : [];
  } catch (error) {
    console.error("Failed to fetch locked schedules:", error);
  }

  return (
    <>
      <div className="flex flex-col gap-3 my-5">
        <LockSchedule
          initialData={initialData}
          semester={semester}
          academicYear={academicYear}
        />
      </div>
    </>
  );
}

export default LockSchedulePage;
