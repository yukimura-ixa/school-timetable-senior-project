import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import LockSchedule from "./component/LockSchedule";
import { getLockedSchedulesAction } from "@/features/lock/application/actions/lock.actions";
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service";
import { PublishReadinessCard } from "@/features/config/presentation/components/PublishReadinessCard";

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

  const configId = `${semester}-${academicYear}`;

  return (
    <>
      <div className="flex flex-col gap-3 my-5">
        <LockSchedule
          initialData={initialData}
          semester={semester}
          academicYear={academicYear}
        />
      </div>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          เผยแพร่ตาราง
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ตรวจความพร้อมก่อนเผยแพร่ — ทุกระดับชั้นต้องจัดครบและผ่านเกณฑ์ ศธ.
        </Typography>
        <PublishReadinessCard configId={configId} />
      </Box>
    </>
  );
}

export default LockSchedulePage;
