import {
  SubjectListSkeleton,
  NetworkErrorEmptyState,
} from "@/components/feedback";
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";
import { SubjectManageClient } from "./component/SubjectManageClient";
import { Suspense } from "react";
import { cookies } from "next/headers";

/**
 * Subject Management Page - Server Component
 * Fetches subject data on the server, passes to client component
 */
export default async function SubjectManagePage() {
  // Force dynamic rendering for Next.js 16
  await cookies();

  const result = await getSubjectsAction({});

  // Error state
  if (!result.success) {
    return <NetworkErrorEmptyState />;
  }

  return (
    <Suspense fallback={<SubjectListSkeleton count={8} />}>
      <SubjectManageClient
        initialData={result.success ? (result.data ?? []) : []}
      />
    </Suspense>
  );
}
