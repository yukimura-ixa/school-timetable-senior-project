"use client"
import React from 'react'
import { useGradeLevelData } from './hooks/gradeLevelData';
import Loading from '@/app/loading';
import GradeLevelTable from '@/app/management/gradelevel/component/GradeLevelTable';

// import TeacherTable from "@/app/management/teacher/component/TeacherTable";
// import { useTeacherData } from "./hooks/teacherData";
// import Loading from "@/app/loading";
type Props = {}

function GradeLevelManage (props: Props) {
  const { tableData, isLoading, error, mutate } = useGradeLevelData(); //ข้อมูลครูใช้ render
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <GradeLevelTable
          tableHead={["รหัสชั้นเรียน", "มัธยมปีที่", "ห้องที่", "สายการเรียน"]}
          tableData={tableData}
          mutate={mutate} 
        />
      )}
    </>
  );
}
export default GradeLevelManage;