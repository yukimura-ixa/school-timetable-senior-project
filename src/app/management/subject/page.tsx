import { SubjectListSkeleton, NetworkErrorEmptyState } from "@/components/feedback";
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";
import { SubjectManageClient } from "./component/SubjectManageClient";
import { Suspense } from "react";

/**
 * Subject Management Page - Server Component
 * Fetches subject data on the server, passes to client component
 */
export default async function SubjectManagePage() {
  const result = await getSubjectsAction();

  // Error state
  if (!result.success) {
    return <NetworkErrorEmptyState onRetry={() => window.location.reload()} />;
  }

  return (
    <Suspense fallback={<SubjectListSkeleton count={8} />}>
      <SubjectManageClient initialData={result.data} />
    </Suspense>
  );
}

