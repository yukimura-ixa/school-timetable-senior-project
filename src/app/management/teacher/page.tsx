"use client";
import React from "react";
import TeacherTable from "@/app/management/teacher/component/TeacherTable";
import { useTeacherData } from "../../_hooks/teacherData";
import Loading from "@/app/loading";

function TeacherManage() {
  const { data, isLoading, error, mutate } = useTeacherData(); //ข้อมูลครูใช้ render

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <TeacherTable
          tableHead={["คำนำหน้าชื่อ", "ชื่อ", "นามสกุล", "กลุ่มสาระ"]}
          tableData={data}
          mutate={mutate} 
        />
      )}
    </>
  );
}
export default TeacherManage;
