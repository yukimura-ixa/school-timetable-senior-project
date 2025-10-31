import { TableSkeleton, NetworkErrorEmptyState } from "@/components/feedback";
import { getGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
import { getProgramsGroupedByYearAction } from "@/features/program/application/actions/program.actions";
import { GradeLevelManageClient } from "./component/GradeLevelManageClient";
import { Suspense } from "react";

/**
 * GradeLevel Management Page - Server Component
 * Fetches gradelevel data on the server, passes to client component
 */
export default async function GradeLevelManagePage() {
  const result = await getGradeLevelsAction();
  const programsByYear = await getProgramsGroupedByYearAction();

  // Error state
  if (!result.success) {
    return <NetworkErrorEmptyState onRetry={() => window.location.reload()} />;
  }

  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <GradeLevelManageClient 
        initialData={result.success ? result.data : []} 
        programsByYear={programsByYear.success ? programsByYear.data : {}} 
      />
    </Suspense>
  );
}
