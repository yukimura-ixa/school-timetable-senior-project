"use client";

import { useState } from "react";
import type { teacher } from "@/prisma/generated/client";
import { TeacherDataGrid } from "@/app/management/teacher/component/TeacherDataGrid";
import {
  NoTeachersEmptyState,
} from "@/components/feedback";
import { useRouter } from "next/navigation";
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions";
import { Box, LinearProgress } from "@mui/material";

type TeacherManageClientProps = {
  initialData: teacher[];
};

/**
 * Client wrapper for Teacher Management
 * Handles UI state, mutations, and re-fetching
 */
export function TeacherManageClient({ initialData }: TeacherManageClientProps) {
  const [teachers, setTeachers] = useState<teacher[]>(initialData ?? []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Mutation callback - refetch data after mutations
  const handleMutate = async () => {
    setIsRefreshing(true);
    const result = await getTeachersAction({});
    if (result.success) {
      setTeachers(result.data ?? []);
    }
    setIsRefreshing(false);
    router.refresh(); // Refresh Server Component data
  };

  // Empty state
  if (!teachers || teachers.length === 0) {
    return (
      <NoTeachersEmptyState onAdd={() => router.push("/management/teacher")} />
    );
  }

  // Success state - now using DataGrid
  return (
    <Box sx={{ position: "relative" }} aria-live="polite">
      {isRefreshing && (
        <>
          <LinearProgress
            sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 }}
          />
          <span className="sr-only">กำลังโหลดข้อมูล...</span>
        </>
      )}
      <TeacherDataGrid initialData={teachers} onMutate={handleMutate} />
    </Box>
  );
}
