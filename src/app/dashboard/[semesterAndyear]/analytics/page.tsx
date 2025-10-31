import { Suspense } from "react";
import type { Metadata } from "next";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  getOverviewStats,
  getTeacherWorkloads,
  getRoomOccupancy,
  OverviewSection,
  TeacherWorkloadSection,
  RoomUtilizationSection,
} from "@/features/analytics";

export const metadata: Metadata = {
  title: "วิเคราะห์ข้อมูล - Analytics Dashboard",
  description: "วิเคราะห์ข้อมูลตารางเรียน ภาระงานสอน การใช้ห้องเรียน และความสมบูรณ์",
};

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ semesterAndyear: string }>;
}) {
  const { semesterAndyear } = await params;

  // Fetch analytics data for Phase 1 (Overview, Teacher, Room)
  const [overviewResult, teacherWorkloadsResult, roomOccupancyResult] =
    await Promise.all([
      getOverviewStats({ configId: semesterAndyear }),
      getTeacherWorkloads({ configId: semesterAndyear }),
      getRoomOccupancy({ configId: semesterAndyear }),
    ]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📊 วิเคราะห์ข้อมูลตารางเรียน
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ภาพรวมและการวิเคราะห์ข้อมูลตารางเรียนภาคเรียนที่ {semesterAndyear}
        </Typography>
      </Box>

      {/* Section 1: Overview */}
      <Suspense fallback={<OverviewSkeleton />}>
        {overviewResult.success ? (
          <OverviewSection stats={overviewResult.data} />
        ) : (
          <ErrorDisplay
            title="ไม่สามารถโหลดข้อมูลภาพรวมได้"
            message={"error" in overviewResult ? overviewResult.error : "Unknown error"}
          />
        )}
      </Suspense>

      {/* Section 2: Teacher Workload */}
      <Suspense fallback={<WorkloadSkeleton />}>
        {teacherWorkloadsResult.success ? (
          <TeacherWorkloadSection workloads={teacherWorkloadsResult.data} />
        ) : (
          <ErrorDisplay
            title="ไม่สามารถโหลดข้อมูลภาระงานสอนได้"
            message={"error" in teacherWorkloadsResult ? teacherWorkloadsResult.error : "Unknown error"}
          />
        )}
      </Suspense>

      {/* Section 3: Room Utilization */}
      <Suspense fallback={<RoomSkeleton />}>
        {roomOccupancyResult.success ? (
          <RoomUtilizationSection occupancy={roomOccupancyResult.data} />
        ) : (
          <ErrorDisplay
            title="ไม่สามารถโหลดข้อมูลการใช้ห้องเรียนได้"
            message={"error" in roomOccupancyResult ? roomOccupancyResult.error : "Unknown error"}
          />
        )}
      </Suspense>

      {/* TODO: Add remaining sections (Subject Distribution, Quality, Time, Compliance) */}
      {/* We'll implement these in Phase 2 */}
    </Box>
  );
}

// Error Display Component
function ErrorDisplay({ title, message }: { title: string; message: string }) {
  return (
    <Box
      sx={{
        p: 4,
        mb: 4,
        bgcolor: "error.light",
        borderRadius: 2,
        border: 1,
        borderColor: "error.main",
      }}
    >
      <Typography variant="h6" color="error" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="error.dark">
        {message}
      </Typography>
    </Box>
  );
}

// Skeleton Loaders
function OverviewSkeleton() {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    </Box>
  );
}

function WorkloadSkeleton() {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    </Box>
  );
}

function RoomSkeleton() {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    </Box>
  );
}
