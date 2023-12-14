"use client";
import React from "react";
import RoomsTable from "@/app/management/rooms/component/RoomsTable";
import { useRoomData } from "./hooks/roomData";
function RoomsManage() {
  const { tableData, isLoading, error, mutate } = useRoomData();
  return (
    <>
      <RoomsTable
        tableHead={["ชื่อห้อง", "อาคาร", "ชั้น"]}
        tableData={tableData}
        mutate={mutate}
      />
    </>
  );
}

export default RoomsManage;
