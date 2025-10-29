"use client";

import { useState } from "react";
import type { subject } from "@/prisma/generated";
import SubjectTable from "@/app/management/subject/component/SubjectTable";
import { SubjectListSkeleton, NoSubjectsEmptyState } from "@/components/feedback";
import { useRouter } from "next/navigation";
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";

type SubjectManageClientProps = {
  initialData: subject[];
};

/**
 * Client wrapper for Subject Management
 * Handles UI state, mutations, and re-fetching
 */
export function SubjectManageClient({ initialData }: SubjectManageClientProps) {
  const [subjects, setSubjects] = useState<subject[]>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Mutation callback - refetch data after mutations
  const handleMutate = async () => {
    setIsRefreshing(true);
    const result = await getSubjectsAction();
    if (result.success) {
      setSubjects(result.data);
    }
    setIsRefreshing(false);
    router.refresh();
  };

  // Empty state
  if (!subjects || subjects.length === 0) {
    return <NoSubjectsEmptyState onAdd={() => router.push("/management/subject")} />;
  }

  // Show skeleton during refresh
  if (isRefreshing) {
    return <SubjectListSkeleton count={8} />;
  }

  // Success state
  return (
    <SubjectTable
      tableData={subjects}
      mutate={handleMutate}
    />
  );
}
