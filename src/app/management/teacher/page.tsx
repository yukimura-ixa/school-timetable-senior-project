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
        {data.id}
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
      case 'id':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.id - b.id : b.id - a.id)
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
        return data.sort((a, b) => a.id - b.id)
    }
  }
  return (
    <>
      <Table
        data={teacherData}
        tableHead={["id", "FirstName", "LastName", "Department"]}
        tableData={tableData}
        orderByFunction={sortData}
      />
    </>
  );
};
export default TeacherManage;
