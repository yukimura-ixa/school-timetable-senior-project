"use client"
import Table from '@/app/management/gradelevel/component/GradeLevelTable';
import React from 'react'
import { BiEdit } from 'react-icons/bi';
import { TbTrash } from 'react-icons/tb';
type Props = {}

const GradeLevelManage = (props: Props) => {
  const tableData = ({ data, handleChange, index, editData, deleteData, checkList }) => (
    <React.Fragment key={`${data.TeacherID} ${data.Firstname}`}>
      <td
        className="font-bold px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.GradeID}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Year}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Number}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.GradeProgram}
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
      case 'รหัสชั้นเรียน':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.GradeID - b.GradeID : b.GradeID - a.GradeID)
      case 'มัธยมปีที่':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Year- b.Year : b.Year - a.Year)
      case 'ห้องที่':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Number- b.Number : b.Number - a.Number)
      case 'สายการเรียน':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.GradeProgram.toLowerCase().localeCompare(b.GradeProgram) : b.Program.toLowerCase().localeCompare(a.Program))
      default:
        return data.sort((a, b) => a.GradeID - b.GradeID)
    }
  }
  return (
    <>
      <Table
        tableHead={["รหัสชั้นเรียน", "มัธยมปีที่", "ห้อง", "สายการเรียน"]}
        tableData={tableData}
        orderByFunction={sortData}
      />
    </>
  );
}
export default GradeLevelManage;