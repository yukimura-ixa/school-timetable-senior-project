"use client";
import React from "react";
import SubjectTable from "@/app/management/subject/component/SubjectTable";
import { useSubjectData } from "./hooks/subjectData";
import Loading from "@/app/loading";

function SubjectManage() {
  const { tableData, isLoading, error, mutate } = useSubjectData();
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <SubjectTable
        tableHead={["รหัสวิชา", "ชื่อวิชา", "หน่วยกิต", "กลุ่มสาระ"]}
        tableData={tableData}
        mutate={mutate}
      />
      )}
    </>
  );
}

export default SubjectManage;
