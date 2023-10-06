"use client"
import React from 'react'
import {roomsData} from '@/raw-data/rooms-table';
import Table from '@/app/management/rooms/component/RoomsTable';
type Props = {}

const RoomsManage = (props: Props) => {
  const tableData = ({ data, handleChange, index }) => (
    <>
      <td
        className="font-bold px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.RoomID}
      </td>
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
    </>
  )
  const sortData = (data: any[], orderState: boolean, orderType: string) => {
    switch(orderType){
      case 'รหัสห้อง':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.RoomID.toLowerCase().localeCompare(b.RoomID) : b.RoomID.toLowerCase().localeCompare(a.RoomID))
      case 'ชื่อห้อง':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.RoomName.toLowerCase().localeCompare(b.RoomName) : b.RoomName.toLowerCase().localeCompare(a.RoomName))
      case 'อาคาร':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Building.toLowerCase().localeCompare(b.Building) : b.Building.toLowerCase().localeCompare(a.Building))
      case 'ชั้น':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.Floor.toLowerCase().localeCompare(b.Floor) : b.Floor.toLowerCase().localeCompare(a.Floor))
      default:
        return  data.sort((a, b) => a.RoomID.toLowerCase().localeCompare(b.RoomID))
    }
  }
  return (
    <>
      <Table
        data={roomsData}
        tableHead={["รหัสห้อง", "ชื่อห้อง", "อาคาร", "ชั้น"]}
        tableData={tableData}
        orderByFunction={sortData}
      />
    </>
  );
};

export default RoomsManage