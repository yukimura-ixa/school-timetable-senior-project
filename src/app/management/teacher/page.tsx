"use client";
import React from "react";
import TeacherTable from "@/app/management/teacher/component/TeacherTable";
import { useTeacherData } from "./hooks/teacherData";
function TeacherManage() {
  const { teacherData, isLoading, error, mutate } = useTeacherData(); //ข้อมูลครูใช้ render

  const sortData = (data: any[], orderState: boolean, orderType: string) => {
    switch (orderType) {
      case "รหัสประจำตัว":
        return data.sort((a, b) =>
          orderState ? a.TeacherID - b.TeacherID : b.TeacherID - a.TeacherID
        );
      case "ชื่อ":
        return data.sort((a, b) =>
          orderState
            ? a.Firstname.toLowerCase().localeCompare(b.Firstname)
            : b.Firstname.toLowerCase().localeCompare(a.Firstname)
        );
      case "นามสกุล":
        return data.sort((a, b) =>
          orderState
            ? a.Lastname.toLowerCase().localeCompare(b.Lastname)
            : b.Lastname.toLowerCase().localeCompare(a.Lastname)
        );
      case "กลุ่มสาระ":
        return data.sort((a, b) =>
          orderState
            ? a.Department.toLowerCase().localeCompare(b.Department)
            : b.Department.toLowerCase().localeCompare(a.Department)
        );
      default:
        return data.sort((a, b) => a.TeacherID - b.TeacherID);
    }
  };
  return (
    <>
      <TeacherTable
        tableHead={["คำนำหน้าชื่อ", "ชื่อ", "นามสกุล", "กลุ่มสาระ"]}
        tableData={teacherData}
        orderByFunction={sortData}
        mutate={mutate}
      />
    </>
  );
}
export default TeacherManage;
