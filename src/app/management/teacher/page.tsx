"use client"
import React, {useState} from "react";
import {teacherData} from '@/raw-data/teacher-table';
import TeacherTable from "@/app/management/teacher/component/TeacherTable";
type Props = {};

const TeacherManage = (props: Props) => {
  const tableData = ({ data, handleChange, index }) => (
    <React.Fragment>
      <td
        className="font-bold px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.TeacherID}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.FirstName}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.LastName}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Department}
      </td>
    </React.Fragment>
  )
  const sortData = (data: any[], orderState: boolean, orderType: string) => {
    switch(orderType){
      case 'รหัสประจำตัว':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.TeacherID - b.TeacherID : b.TeacherID - a.TeacherID)
      case 'ชื่อ':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.FirstName.toLowerCase().localeCompare(b.FirstName) : b.FirstName.toLowerCase().localeCompare(a.FirstName))
      case 'นามสกุล':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.LastName.toLowerCase().localeCompare(b.LastName) : b.LastName.toLowerCase().localeCompare(a.LastName))
      case 'กลุ่มสาระ':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Department.toLowerCase().localeCompare(b.Department) : b.Department.toLowerCase().localeCompare(a.Department))
      default:
        return data.sort((a, b) => a.TeacherID - b.TeacherID)
    }
  }
  return (
    <>
      <TeacherTable
        data={teacherData}
        tableHead={["รหัสประจำตัว", "ชื่อ", "นามสกุล", "กลุ่มสาระ"]}
        tableData={tableData}
        orderByFunction={sortData}
      />
    </>
  );
};
export default TeacherManage;
