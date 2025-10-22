"use client";
import TeacherTable from "@/app/management/teacher/component/TeacherTable";
import { useTeacherData } from "../../_hooks/teacherData";
import { TeacherListSkeleton, NoTeachersEmptyState, NetworkErrorEmptyState } from "@/components/feedback";
import { useRouter } from "next/navigation";

function TeacherManage() {
  const { data, isLoading, error, mutate } = useTeacherData(); //ข้อมูลครูใช้ render
  const router = useRouter();

  // Loading state
  if (isLoading) {
    return <TeacherListSkeleton count={6} />;
  }

  // Error state
  if (error) {
    return <NetworkErrorEmptyState onRetry={() => mutate()} />;
  }

  // Empty state
  if (!data || data.length === 0) {
    return <NoTeachersEmptyState onAdd={() => router.push("/management/teacher")} />;
  }

  // Success state
  return (
    <TeacherTable
      tableHead={["คำนำหน้าชื่อ", "ชื่อ", "นามสกุล", "กลุ่มสาระ", "อีเมล"]}
      tableData={data}
      mutate={mutate} 
    />
  );
}
export default TeacherManage;
