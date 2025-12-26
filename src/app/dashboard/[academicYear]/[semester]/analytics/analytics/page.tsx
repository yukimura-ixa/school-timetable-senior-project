import { Suspense } from "react";
import type { Metadata } from "next";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  getPeriodDistribution,
  getDayDistribution,
  getProgramCompliance,
  TimeDistributionSection,
  ComplianceSection,
} from "@/features/analytics";

export const metadata: Metadata = {
  title: "วิเคราะห์ข้อมูล - Analytics Dashboard",
  description: "วิเคราะห์การกระจายช่วงเวลาและความสอดคล้องหลักสูตร",
};

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
}) {
  const { academicYear, semester } = await params;
  const configId = `${semester}-${academicYear}`;

  // Fetch analytics data
  const [periodDistributionResult, dayDistributionResult, programComplianceResult] =
    await Promise.all([
      getPeriodDistribution({ configId }),
      getDayDistribution({ configId }),
      getProgramCompliance({ configId }),
    ]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📊 วิเคราะห์ข้อมูลตารางเรียน
        </Typography>
        <Typography variant="body1" color="text.secondary">
          การกระจายช่วงเวลาและความสอดคล้องหลักสูตร ภาคเรียนที่ {semester}/
          {academicYear}
        </Typography>
      </Box>

      {/* Section 1: Time Distribution */}
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

      {/* Section 2: Curriculum Compliance */}
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
