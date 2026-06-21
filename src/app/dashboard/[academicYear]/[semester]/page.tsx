import type { Metadata } from "next";
import { Suspense } from "react";
import { Box, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { dashboardRepository } from "@/features/dashboard/infrastructure/repositories/dashboard.repository";
import {
  calculateTeacherWorkload,
  calculateSubjectDistribution,
} from "@/features/dashboard/domain/services/dashboard-stats.service";
import type { semester } from "@/prisma/generated/client";
import TeacherWorkloadChart from "../../_components/TeacherWorkloadChart";
import SubjectDistributionChart from "../../_components/SubjectDistributionChart";
import { ActionCenter } from "../../_components/ActionCenter";
import { QuickNav } from "../../_components/QuickNav";

export const metadata: Metadata = {
  title: "Dashboard - ภาพรวมภาคเรียน",
  description: "ภาพรวมข้อมูลตารางเรียนและสถิติของภาคเรียน",
};

function InvalidParam({ message }: { message: string }) {
  return (
    <Box sx={{ p: 4 }}>
      <Paper
        sx={{
          p: 3,
          borderColor: "error.light",
          borderWidth: 1,
          borderStyle: "solid",
        }}
      >
        <Typography
          color="error"
          sx={{
            fontWeight: 700,
          }}
        >
          ข้อผิดพลาด
        </Typography>
        <Typography
          sx={{
            color: "error.main",
          }}
        >
          {message}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mt: 1,
          }}
        >
          กรุณาเลือกภาคเรียนจากหน้าหลัก
        </Typography>
      </Paper>
    </Box>
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
}) {
  const { academicYear: yearStr, semester: semStr } = await params;
  const year = parseInt(yearStr, 10);
  const semester = parseInt(semStr, 10) as 1 | 2;
  const semesterAndyear = `${semester}-${year}`;

  if (isNaN(year) || year < 2500 || year > 2600) {
    return <InvalidParam message={`ปีการศึกษาไม่ถูกต้อง (${yearStr})`} />;
  }
  if (semester !== 1 && semester !== 2) {
    return <InvalidParam message={`ภาคเรียนไม่ถูกต้อง (${semStr})`} />;
  }

  const semesterEnum = `SEMESTER_${semester}` as semester;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3 }}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
          }}
        >
          ภาพรวมภาคเรียน
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          ภาคเรียนที่ {semester}/{year}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <Suspense fallback={<ActionCenterSkeleton />}>
            <ActionCenter
              semesterAndyear={semesterAndyear}
              year={year}
              semester={semester}
              semesterEnum={semesterEnum}
            />
          </Suspense>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <QuickNav year={year} semester={semester} />
        </Box>
      </Box>
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection year={year} semesterEnum={semesterEnum} />
      </Suspense>
    </Box>
  );
}

function ActionCenterSkeleton() {
  return (
    <Paper sx={{ p: 2.75 }}>
      <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
      <Stack spacing={1.25}>
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={70} />
        ))}
      </Stack>
    </Paper>
  );
}

function ChartsSkeleton() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        gap: 3,
      }}
    >
      {[1, 2].map((i) => (
        <Paper key={i} sx={{ p: 3 }}>
          <Skeleton variant="text" width={160} height={24} sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            {[1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} variant="rounded" height={28} />
            ))}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

async function ChartsSection({
  year,
  semesterEnum,
}: {
  year: number;
  semesterEnum: semester;
}) {
  const [schedules, teachers, subjects] = await Promise.all([
    dashboardRepository.getScheduleStatsData(year, semesterEnum),
    dashboardRepository.getTeachersBasic(),
    dashboardRepository.getSubjectsBasic(),
  ]);
  const teacherWorkload = calculateTeacherWorkload(schedules, teachers).slice(
    0,
    10,
  );
  const subjectDistribution = calculateSubjectDistribution(
    schedules,
    subjects,
  ).slice(0, 10);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        gap: 3,
      }}
    >
      <TeacherWorkloadChart workload={teacherWorkload} />
      <SubjectDistributionChart distribution={subjectDistribution} />
    </Box>
  );
}
