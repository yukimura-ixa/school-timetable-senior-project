import { TeacherListSkeleton, NetworkErrorEmptyState } from "@/components/feedback";
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions";
import { TeacherManageClient } from "./component/TeacherManageClient";
import { Suspense } from "react";
import { cookies } from "next/headers";

/**
 * Teacher Management Page - Server Component
 * Fetches teacher data on the server, passes to client component
 */
export default async function TeacherManagePage() {
  // Force dynamic rendering for Next.js 16
  await cookies();
  
  const result = await getTeachersAction();

  // Error state
  if (!result.success) {
    return <NetworkErrorEmptyState onRetry={() => window.location.reload()} />;
  }

  return (
    <Suspense fallback={<TeacherListSkeleton count={6} />}>
      <TeacherManageClient initialData={result.success ? result.data : []} />
    </Suspense>
  );
}

