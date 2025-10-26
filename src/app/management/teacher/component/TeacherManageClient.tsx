"use client";

import { useState } from "react";
import type { teacher } from "@prisma/client";
import TeacherTable from "@/app/management/teacher/component/TeacherTable";
import { TeacherListSkeleton, NoTeachersEmptyState } from "@/components/feedback";
import { useRouter } from "next/navigation";
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions";

type TeacherManageClientProps = {
  initialData: teacher[];
};

/**
 * Client wrapper for Teacher Management
 * Handles UI state, mutations, and re-fetching
 */
export function TeacherManageClient({ initialData }: TeacherManageClientProps) {
  const [teachers, setTeachers] = useState<teacher[]>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Mutation callback - refetch data after mutations
  const handleMutate = async () => {
    setIsRefreshing(true);
    const result = await getTeachersAction();
    if (result.success) {
      setTeachers(result.data);
    }
    setIsRefreshing(false);
    router.refresh(); // Refresh Server Component data
  };

  // Empty state
  if (!teachers || teachers.length === 0) {
    return <NoTeachersEmptyState onAdd={() => router.push("/management/teacher")} />;
  }

  // Show skeleton during refresh
  if (isRefreshing) {
    return <TeacherListSkeleton count={6} />;
  }

  // Success state
  return (
    <TeacherTable
      tableHead={["คำนำหน้าชื่อ", "ชื่อ", "นามสกุล", "กลุ่มสาระ", "อีเมล"]}
      tableData={teachers}
      mutate={handleMutate}
    />
  );
}
