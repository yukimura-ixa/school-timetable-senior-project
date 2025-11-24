import { TeacherAssignmentPage } from "@/features/teaching-assignment/presentation/components";
import { Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
import type { Metadata } from "next";

/**
 * Teacher Assignment Management Page - Server Component
 * Route: /management/teacher-assignment
 *
 * Allows administrators to assign teachers to subjects for each grade,
 * semester, and academic year with workload validation.
 */
export const metadata: Metadata = {
  title: "จัดการมอบหมายครูผู้สอน - Phrasongsa Timetable",
  description: "มอบหมายครูสอนรายวิชาแต่ละระดับชั้น พร้อมตรวจสอบภาระงานสอน",
};

function LoadingSkeleton() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function TeacherAssignmentManagementPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TeacherAssignmentPage />
    </Suspense>
  );
}
