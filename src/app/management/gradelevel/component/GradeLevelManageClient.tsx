"use client";

import { useState } from "react";
import type { gradelevel, program } from "@/prisma/generated/client";
import { GradeLevelDataGrid } from "@/app/management/gradelevel/component/GradeLevelDataGrid";
import { NoDataEmptyState } from "@/components/feedback";
import { useRouter } from "next/navigation";
import { getGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
import { Box, LinearProgress } from "@mui/material";

type GradeLevelManageClientProps = {
  initialData: gradelevel[];
  programsByYear: Record<number, program[]>;
};

/**
 * Client wrapper for GradeLevel Management
 * Handles UI state, mutations, and re-fetching
 */
export function GradeLevelManageClient({
  initialData,
  programsByYear,
}: GradeLevelManageClientProps) {
  const [gradelevels, setGradelevels] = useState<gradelevel[]>(
    initialData ?? [],
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const router = useRouter();

  // Mutation callback - refetch data after mutations
  const handleMutate = async () => {
    setIsRefreshing(true);
    const result = await getGradeLevelsAction({});
    if (result.success) {
      setGradelevels(result.data ?? []);
    }
    setIsRefreshing(false);
    router.refresh();
  };

  // Empty state
  if ((!gradelevels || gradelevels.length === 0) && !showTable) {
    return <NoDataEmptyState entityName="ระดับชั้น" onAdd={() => setShowTable(true)} />;
  }

  // Success state - now using DataGrid
  return (
    <Box sx={{ position: "relative" }}>
      {isRefreshing && (
        <LinearProgress
          sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 }}
        />
      )}
      <GradeLevelDataGrid
        initialData={gradelevels}
        onMutate={handleMutate}
        programsByYear={programsByYear}
      />
    </Box>
  );
}
