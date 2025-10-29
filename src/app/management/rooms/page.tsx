import { TableSkeleton, NetworkErrorEmptyState } from "@/components/feedback";
import { getRoomsAction } from "@/features/room/application/actions/room.actions";
import { RoomsManageClient } from "./component/RoomsManageClient";
import { Suspense } from "react";

/**
 * Rooms Management Page - Server Component
 * Fetches room data on the server, passes to client component
 */
export default async function RoomsManagePage() {
  const result = await getRoomsAction();

  // Error state
  if (!result.success) {
    return <NetworkErrorEmptyState onRetry={() => window.location.reload()} />;
  }

  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <RoomsManageClient initialData={result.data} />
    </Suspense>
  );
}

