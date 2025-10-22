"use client";
import RoomsTable from "@/app/management/rooms/component/RoomsTable";
import { useRoomData } from "../../_hooks/roomData";
import { TableSkeleton, NoRoomsEmptyState, NetworkErrorEmptyState } from "@/components/feedback";

function RoomsManage() {
  const { data, isLoading, error, mutate } = useRoomData();

  if (isLoading) {
    return <TableSkeleton rows={6} />;
  }

  if (error) {
    return <NetworkErrorEmptyState onRetry={() => mutate()} />;
  }

  if (!data || data.length === 0) {
    return <NoRoomsEmptyState />;
  }

  return (
    <RoomsTable
      tableHead={["ชื่อห้อง", "อาคาร", "ชั้น", ""]}
      tableData={data}
      mutate={mutate}
    />
  );
}

export default RoomsManage;
