"use client";

import { useState } from "react";
import type { room } from "@/prisma/generated/client";
import RoomsTable from "@/app/management/rooms/component/RoomsTable";
import { TableSkeleton, NoRoomsEmptyState } from "@/components/feedback";
import { useRouter } from "next/navigation";
import { getRoomsAction } from "@/features/room/application/actions/room.actions";

type RoomsManageClientProps = {
  initialData: room[];
};

/**
 * Client wrapper for Rooms Management
 * Handles UI state, mutations, and re-fetching
 */
export function RoomsManageClient({ initialData }: RoomsManageClientProps) {
  const [rooms, setRooms] = useState<room[]>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Mutation callback - refetch data after mutations
  const handleMutate = async () => {
    setIsRefreshing(true);
    const result = await getRoomsAction();
    if (result.success) {
      setRooms(result.data);
    }
    setIsRefreshing(false);
    router.refresh();
  };

  // Empty state
  if (!rooms || rooms.length === 0) {
    return <NoRoomsEmptyState />;
  }

  // Show skeleton during refresh
  if (isRefreshing) {
    return <TableSkeleton rows={6} />;
  }

  // Success state
  return <RoomsTable tableData={rooms} mutate={handleMutate} />;
}
