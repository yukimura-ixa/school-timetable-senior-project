"use client"
import React from 'react'
import {roomsData} from '@/raw-data/rooms-table';
import Table from '@/app/management/rooms/component/RoomsTable';
import { BiEdit } from 'react-icons/bi';
import { TbTrash } from 'react-icons/tb';
type Props = {}

const RoomsManage = (props: Props) => {
  const tableData = ({ data, handleChange, index, editData, deleteData, checkList }) => (
    <>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.RoomName}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Building}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Floor}
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
    </>
  )
  const sortData = (data: any[], orderState: boolean, orderType: string) => {
    switch(orderType){
      case 'ชื่อห้อง':
        return data.sort((a, b) => orderState? a.RoomName.toLowerCase().localeCompare(b.RoomName) : b.RoomName.toLowerCase().localeCompare(a.RoomName))
      case 'อาคาร':
        return data.sort((a, b) => orderState? a.Building.toLowerCase().localeCompare(b.Building) : b.Building.toLowerCase().localeCompare(a.Building))
      case 'ชั้น':
        return data.sort((a, b) => orderState? a.Floor.toLowerCase().localeCompare(b.Floor) : b.Floor.toLowerCase().localeCompare(a.Floor))
      default:
        return  data.sort((a, b) => a.RoomName.toLowerCase().localeCompare(b.RoomName))
    }
  }
  return (
    <>
      <Table
        tableHead={["ชื่อห้อง", "อาคาร", "ชั้น"]}
        tableData={tableData}
        orderByFunction={sortData}
      />
    </>
  );
};

export default RoomsManage