"use client";

import useSWR from "swr";
import type { room } from "@/prisma/generated/client";
import { getRoomsAction } from "@/features/room/application/actions/room.actions";

/**
 * React hook for fetching all rooms.
 * Uses SWR for caching and revalidation.
 *
 * @returns {Object} Rooms data with loading/error states
 * @example
 * const { data, isLoading, error, mutate } = useRooms()
 */
export const useRooms = () => {
  const { data, error, mutate } = useSWR<room[]>("rooms", async () => {
    const result = await getRoomsAction();
    return result.success ? result.data : [];
  });

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
