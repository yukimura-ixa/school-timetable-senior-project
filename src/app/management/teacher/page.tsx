// "use server"
"use client"
import React, {useState, useEffect} from "react";
import TeacherTable from "@/app/management/teacher/component/TeacherTable";
import { BiEdit } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";
type Props = {};
function TeacherManage (props: Props) {
  const tableData = ({ data, handleChange, index, editData, deleteData, checkList }) => (
    <React.Fragment key={`${data.TeacherID} ${data.Firstname}`}>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Prefix}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Firstname}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Lastname}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Department}
      </td>
      {checkList.length < 1
      ?
      <>
      <td
        className="flex gap-5 px-6 whitespace-nowrap select-none absolute right-0 top-5"
      >
        <BiEdit className="fill-[#A16207]" size={18} onClick={() => {editData(), handleChange(index)}}/>
        <TbTrash className="text-red-500" size={18} onClick={() => {deleteData(), handleChange(index)}}/>
      </td>
      </>
      :
      null
      }
    </React.Fragment>
  )
  const sortData = (data: any[], orderState: boolean, orderType: string) => {
    switch(orderType){
      case 'รหัสประจำตัว':
        return data.sort((a, b) => orderState? a.TeacherID - b.TeacherID : b.TeacherID - a.TeacherID)
      case 'ชื่อ':
        return data.sort((a, b) => orderState? a.Firstname.toLowerCase().localeCompare(b.Firstname) : b.Firstname.toLowerCase().localeCompare(a.Firstname))
      case 'นามสกุล':
        return data.sort((a, b) => orderState? a.Lastname.toLowerCase().localeCompare(b.Lastname) : b.Lastname.toLowerCase().localeCompare(a.Lastname))
      case 'กลุ่มสาระ':
        return data.sort((a, b) => orderState? a.Department.toLowerCase().localeCompare(b.Department) : b.Department.toLowerCase().localeCompare(a.Department))
      default:
        return data.sort((a, b) => a.TeacherID - b.TeacherID)
    }
  }
  return (
    <>
      <TeacherTable
        tableHead={["คำนำหน้าชื่อ", "ชื่อ", "นามสกุล", "กลุ่มสาระ"]}
        tableData={tableData}
        orderByFunction={sortData}
      />
    </>
  );
};
export default TeacherManage;
