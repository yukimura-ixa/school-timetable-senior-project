"use client";

import { useState } from "react";
import type { subject } from "@/prisma/generated/client";
import { SubjectDataGrid } from "@/app/management/subject/component/SubjectDataGrid";
import {
  NoSubjectsEmptyState,
} from "@/components/feedback";
import { useRouter } from "next/navigation";
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";
import { Box, LinearProgress } from "@mui/material";

type SubjectManageClientProps = {
  initialData: subject[];
};

/**
 * Client wrapper for Subject Management
 * Handles UI state, mutations, and re-fetching
 */
export function SubjectManageClient({ initialData }: SubjectManageClientProps) {
  const [subjects, setSubjects] = useState<subject[]>(initialData ?? []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Mutation callback - refetch data after mutations
  const handleMutate = async () => {
    setIsRefreshing(true);
    const result = await getSubjectsAction({});
    if (result.success) {
      setSubjects(result.data ?? []);
    }
    setIsRefreshing(false);
    router.refresh();
  };

  // Empty state
  if (!subjects || subjects.length === 0) {
    return (
      <NoSubjectsEmptyState onAdd={() => router.push("/management/subject")} />
    );
  }

  // Success state - now using DataGrid
  return (
    <Box sx={{ position: "relative" }}>
      {isRefreshing && (
        <LinearProgress
          sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 }}
        />
      )}
      <SubjectDataGrid initialData={subjects} onMutate={handleMutate} />
    </Box>
  );
}
