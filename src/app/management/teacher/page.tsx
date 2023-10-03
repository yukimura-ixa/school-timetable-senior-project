"use client"
import React from "react";
import Table from "@/components/templates/Table";
import {teacherData} from '@/raw-data/teacher-table';
type Props = {};

const TeacherManage = (props: Props) => {
  const tableData = ({ data, handleChange, index }) => (
    <>
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
    </>
  )
  const sortData = (data: any[], orderState: boolean, orderType: string) => {
    switch(orderType){
      case 'TeacherID':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.TeacherID - b.TeacherID : b.TeacherID - a.TeacherID)
      case 'FirstName':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.FirstName.toLowerCase().localeCompare(b.FirstName) : b.FirstName.toLowerCase().localeCompare(a.FirstName))
      case 'LastName':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.LastName.toLowerCase().localeCompare(b.LastName) : b.LastName.toLowerCase().localeCompare(a.LastName))
      case 'Department':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Department.toLowerCase().localeCompare(b.Department) : b.Department.toLowerCase().localeCompare(a.Department))
      default:
        console.log('else')
        return data.sort((a, b) => a.TeacherID - b.TeacherID)
    }
  }
  return (
    <>
      <Table
        data={teacherData}
        tableHead={["TeacherID", "FirstName", "LastName", "Department"]}
        tableData={tableData}
        orderByFunction={sortData}
      />
    </>
  );
};
export default TeacherManage;
