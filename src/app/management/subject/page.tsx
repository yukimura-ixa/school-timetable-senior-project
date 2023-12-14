"use client";
import React from "react";
import SubjectTable from "@/app/management/subject/component/SubjectTable";
import { useSubjectData } from "./hooks/subjectData";

function SubjectManage() {
  const { subjectData, isLoading, error, mutate } = useSubjectData();
  return (
    <>
      <SubjectTable
        tableHead={["รหัสวิชา", "ชื่อวิชา", "หน่วยกิต", "กลุ่มสาระ"]}
        tableData={subjectData}
        mutate={mutate}
      />
    </>
  );
}

export default SubjectManage;
