"use client";
import SubjectTable from "@/app/management/subject/component/SubjectTable";
import { useSubjectData } from "../../_hooks/subjectData";
import { SubjectListSkeleton, NoSubjectsEmptyState, NetworkErrorEmptyState } from "@/components/feedback";
import { useRouter } from "next/navigation";

function SubjectManage() {
  const { data, isLoading, error, mutate } = useSubjectData();
  const router = useRouter();

  // Loading state
  if (isLoading) {
    return <SubjectListSkeleton count={8} />;
  }

  // Error state
  if (error) {
    return <NetworkErrorEmptyState onRetry={() => mutate()} />;
  }

  // Empty state
  if (!data || data.length === 0) {
    return <NoSubjectsEmptyState onAdd={() => router.push("/management/subject")} />;
  }

  // Success state
  return (
    <SubjectTable
      tableHead={["รหัสวิชา", "ชื่อวิชา", "หน่วยกิต", "สาระการเรียนรู้", ""]}
      tableData={data}
      mutate={mutate}
    />
  );
}

export default SubjectManage;
