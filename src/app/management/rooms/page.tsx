"use client";
import React from "react";
import RoomsTable from "@/app/management/rooms/component/RoomsTable";
import { useRoomData } from "./hooks/roomData";
import Loading from "@/app/loading";
function RoomsManage() {
  const { tableData, isLoading, error, mutate } = useRoomData();
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <RoomsTable
          tableHead={["ชื่อห้อง", "อาคาร", "ชั้น"]}
          tableData={tableData}
          mutate={mutate}
        />
      )}
    </>
  );
}

export default RoomsManage;
