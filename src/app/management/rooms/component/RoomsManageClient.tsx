"use client";

import { useState } from "react";
import type { room } from "@/prisma/generated/client";
import RoomsTable from "@/app/management/rooms/component/RoomsTable";
import { NoRoomsEmptyState } from "@/components/feedback";
import { useRouter } from "next/navigation";
import { getRoomsAction } from "@/features/room/application/actions/room.actions";
import { Box, LinearProgress } from "@mui/material";

type RoomsManageClientProps = {
  initialData: room[];
};

/**
 * Client wrapper for Rooms Management
 * Handles UI state, mutations, and re-fetching
 */
export function RoomsManageClient({ initialData }: RoomsManageClientProps) {
  const [rooms, setRooms] = useState<room[]>(initialData ?? []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const router = useRouter();

  // Mutation callback - refetch data after mutations
  const handleMutate = async () => {
    setIsRefreshing(true);
    const result = await getRoomsAction({});
    if (result.success) {
      setRooms(result.data ?? []);
    }
    setIsRefreshing(false);
    router.refresh();
  };

  // Empty state
  if ((!rooms || rooms.length === 0) && !showTable) {
    return <NoRoomsEmptyState onAdd={() => setShowTable(true)} />;
  }

  // Success state
  return (
    <Box sx={{ position: "relative" }} aria-live="polite">
      {isRefreshing && (
        <>
          <LinearProgress
            sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 }}
          />
          <span className="sr-only">กำลังโหลดข้อมูล...</span>
        </>
      )}
      <RoomsTable tableData={rooms} mutate={handleMutate} />
    </Box>
  );
}
