"use client";

import { useState } from "react";
import type { gradelevel } from "@prisma/client";
import GradeLevelTable from "@/app/management/gradelevel/component/GradeLevelTable";
import { TableSkeleton, NoDataEmptyState } from "@/components/feedback";
import { useRouter } from "next/navigation";
import { getGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions";

type GradeLevelManageClientProps = {
  initialData: gradelevel[];
};

/**
 * Client wrapper for GradeLevel Management
 * Handles UI state, mutations, and re-fetching
 */
export function GradeLevelManageClient({ initialData }: GradeLevelManageClientProps) {
  const [gradelevels, setGradelevels] = useState<gradelevel[]>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Mutation callback - refetch data after mutations
  const handleMutate = async () => {
    setIsRefreshing(true);
    const result = await getGradeLevelsAction();
    if (result.success) {
      setGradelevels(result.data);
    }
    setIsRefreshing(false);
    router.refresh();
  };

  // Empty state
  if (!gradelevels || gradelevels.length === 0) {
    return <NoDataEmptyState />;
  }

  // Show skeleton during refresh
  if (isRefreshing) {
    return <TableSkeleton rows={6} />;
  }

  // Success state
  return (
    <GradeLevelTable
      tableHead={["รหัสชั้นเรียน", "มัธยมปีที่", "ห้องที่", "หลักสูตร", ""]}
      tableData={gradelevels}
      mutate={handleMutate}
    />
  );
}
