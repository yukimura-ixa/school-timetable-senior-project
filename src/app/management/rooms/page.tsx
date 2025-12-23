import { TableSkeleton, NetworkErrorEmptyState } from "@/components/feedback";
import { getRoomsAction } from "@/features/room/application/actions/room.actions";
import { RoomsManageClient } from "./component/RoomsManageClient";
import { Suspense } from "react";
import { cookies } from "next/headers";

/**
 * Rooms Management Page - Server Component
 * Fetches room data on the server, passes to client component
 */
export default async function RoomsManagePage() {
  // Force dynamic rendering for Next.js 16
  await cookies();

  const result = await getRoomsAction({});

  // Error state
  if (!result.success) {
    return <NetworkErrorEmptyState />;
  }

  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <RoomsManageClient
        initialData={result.success ? (result.data ?? []) : []}
      />
    </Suspense>
  );
}
