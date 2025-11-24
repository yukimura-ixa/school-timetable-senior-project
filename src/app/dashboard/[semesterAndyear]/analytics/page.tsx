import { Suspense } from "react";
import type { Metadata } from "next";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  // Phase 1 actions
  getOverviewStats,
  getTeacherWorkloads,
  getRoomOccupancy,
  // Phase 2 actions
  getSubjectDistribution,
  getQualityMetrics,
  isQualityAcceptable,
  getPeriodDistribution,
  getDayDistribution,
  getProgramCompliance,
  // Phase 1 components
  OverviewSection,
  TeacherWorkloadSection,
  RoomUtilizationSection,
  // Phase 2 components
  SubjectDistributionSection,
  QualityMetricsSection,
  TimeDistributionSection,
  ComplianceSection,
} from "@/features/analytics";

export const metadata: Metadata = {
  title: "วิเคราะห์ข้อมูล - Analytics Dashboard",
  description:
    "วิเคราะห์ข้อมูลตารางเรียน ภาระงานสอน การใช้ห้องเรียน และความสมบูรณ์",
};

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ semesterAndyear: string }>;
}) {
  const { semesterAndyear } = await params;

  // Fetch analytics data for Phase 1 + Phase 2
  const [
    overviewResult,
    teacherWorkloadsResult,
    roomOccupancyResult,
    subjectDistributionResult,
    qualityMetricsResult,
    qualityCheckResult,
    periodDistributionResult,
    dayDistributionResult,
    programComplianceResult,
  ] = await Promise.all([
    // Phase 1
    getOverviewStats({ configId: semesterAndyear }),
    getTeacherWorkloads({ configId: semesterAndyear }),
    getRoomOccupancy({ configId: semesterAndyear }),
    // Phase 2
    getSubjectDistribution({ configId: semesterAndyear }),
    getQualityMetrics({ configId: semesterAndyear }),
    isQualityAcceptable({ configId: semesterAndyear }),
    getPeriodDistribution({ configId: semesterAndyear }),
    getDayDistribution({ configId: semesterAndyear }),
    getProgramCompliance({ configId: semesterAndyear }),
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
            message={
              "error" in overviewResult ? overviewResult.error : "Unknown error"
            }
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
            message={
              "error" in teacherWorkloadsResult
                ? teacherWorkloadsResult.error
                : "Unknown error"
            }
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
            message={
              "error" in roomOccupancyResult
                ? roomOccupancyResult.error
                : "Unknown error"
            }
          />
        )}
      </Suspense>

      {/* Section 4: Subject Distribution */}
      <Suspense fallback={<SubjectSkeleton />}>
        {subjectDistributionResult.success ? (
          <SubjectDistributionSection
            distribution={subjectDistributionResult.data}
          />
        ) : (
          <ErrorDisplay
            title="ไม่สามารถโหลดข้อมูลการกระจายรายวิชาได้"
            message={
              "error" in subjectDistributionResult
                ? subjectDistributionResult.error
                : "Unknown error"
            }
          />
        )}
      </Suspense>

      {/* Section 5: Quality Metrics */}
      <Suspense fallback={<QualitySkeleton />}>
        {qualityMetricsResult.success && qualityCheckResult.success ? (
          <QualityMetricsSection
            metrics={qualityMetricsResult.data}
            qualityCheck={qualityCheckResult.data}
          />
        ) : (
          <ErrorDisplay
            title="ไม่สามารถโหลดข้อมูลคุณภาพตารางได้"
            message={
              !qualityMetricsResult.success && "error" in qualityMetricsResult
                ? qualityMetricsResult.error
                : !qualityCheckResult.success && "error" in qualityCheckResult
                  ? qualityCheckResult.error
                  : "Unknown error"
            }
          />
        )}
      </Suspense>

      {/* Section 6: Time Distribution */}
      <Suspense fallback={<TimeSkeleton />}>
        {periodDistributionResult.success && dayDistributionResult.success ? (
          <TimeDistributionSection
            periodDistribution={periodDistributionResult.data}
            dayDistribution={dayDistributionResult.data}
          />
        ) : (
          <ErrorDisplay
            title="ไม่สามารถโหลดข้อมูลการกระจายช่วงเวลาได้"
            message={
              !periodDistributionResult.success &&
              "error" in periodDistributionResult
                ? periodDistributionResult.error
                : !dayDistributionResult.success &&
                    "error" in dayDistributionResult
                  ? dayDistributionResult.error
                  : "Unknown error"
            }
          />
        )}
      </Suspense>

      {/* Section 7: Curriculum Compliance */}
      <Suspense fallback={<ComplianceSkeleton />}>
        {programComplianceResult.success ? (
          <ComplianceSection programCompliance={programComplianceResult.data} />
        ) : (
          <ErrorDisplay
            title="ไม่สามารถโหลดข้อมูลการตรวจสอบหลักสูตรได้"
            message={
              "error" in programComplianceResult
                ? programComplianceResult.error
                : "Unknown error"
            }
          />
        )}
      </Suspense>
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

function SubjectSkeleton() {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    </Box>
  );
}

function QualitySkeleton() {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    </Box>
  );
}

function TimeSkeleton() {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    </Box>
  );
}

function ComplianceSkeleton() {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    </Box>
  );
}
