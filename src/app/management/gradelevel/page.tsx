"use client"
import Table from '@/components/templates/Table'
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
      case 'GradeLevelID':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.GradeLevelID.localeCompare(b.GradeLevelID) : b.GradeLevelID.localeCompare(a.GradeLevelID))
      case 'Year':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Year- b.Year : b.Year - a.Year)
      case 'Number':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Number- b.Number : b.Number - a.Number)
      case 'Program':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Program.toLowerCase().localeCompare(b.Program) : b.Program.toLowerCase().localeCompare(a.Program))
      default:
        console.log('else')
        return data.sort((a, b) => a.GradeLevelID.localeCompare(b.GradeLevelID))
    }
  }
  return (
    <>
      {/* <Table
        data={gradeLevelData}
        tableHead={["GradeLevelID", "Year", "Number", "Program"]}
        tableData={tableData}
        orderByFunction={sortData}
      /> */}
    </>
  );
}
export default GradeLevelManage;