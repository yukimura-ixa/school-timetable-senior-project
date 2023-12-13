"use client";
import React from "react";
import TeacherTable from "@/app/management/teacher/component/TeacherTable";
import { useTeacherData } from "./hooks/teacherData";
function TeacherManage() {
  const { teacherData, isLoading, error, mutate } = useTeacherData(); //ข้อมูลครูใช้ render
  return (
    <>
      <TeacherTable
        tableHead={["คำนำหน้าชื่อ", "ชื่อ", "นามสกุล", "กลุ่มสาระ"]}
        tableData={teacherData}
        mutate={mutate}
      />
    </>
  );
}
export default TeacherManage;
