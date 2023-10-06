"use client"
import Table from '@/app/management/gradelevel/component/GradeLevelTable';
import React from 'react'
import {gradeLevelData} from '@/raw-data/gradelevel-table';
type Props = {}

const GradeLevelManage = (props: Props) => {
  const tableData = ({ data, handleChange, index }) => (
    <>
      <td
        className="font-bold px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.GradeLevelID}
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
        {data.Program}
      </td>
    </>
  )
  const sortData = (data: any[], orderState: boolean, orderType: string) => {
    switch(orderType){
      case 'รหัสชั้นเรียน':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.GradeLevelID.localeCompare(b.GradeLevelID) : b.GradeLevelID.localeCompare(a.GradeLevelID))
      case 'มัธยมปีที่':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Year- b.Year : b.Year - a.Year)
      case 'ห้อง':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Number- b.Number : b.Number - a.Number)
      case 'สายการเรียน':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Program.toLowerCase().localeCompare(b.Program) : b.Program.toLowerCase().localeCompare(a.Program))
      default:
        return data.sort((a, b) => a.GradeLevelID.localeCompare(b.GradeLevelID))
    }
  }
  return (
    <>
      <Table
        data={gradeLevelData}
        tableHead={["รหัสชั้นเรียน", "มัธยมปีที่", "ห้อง", "สายการเรียน"]}
        tableData={tableData}
        orderByFunction={sortData}
      />
    </>
  );
}
export default GradeLevelManage;