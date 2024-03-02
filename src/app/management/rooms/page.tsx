"use client";
import React from "react";
import RoomsTable from "@/app/management/rooms/component/RoomsTable";
import { useRoomData } from "../../_hooks/roomData"
import Loading from "@/app/loading";
function RoomsManage() {
  const { data, isLoading, error, mutate } = useRoomData();
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <RoomsTable
          tableHead={["ชื่อห้อง", "อาคาร", "ชั้น", ""]}
          tableData={data}
          mutate={mutate}
        />
      )}
    </>
  );
}

export default RoomsManage;
