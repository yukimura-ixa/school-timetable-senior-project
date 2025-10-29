"use client";

import { useState, useEffect } from "react";
import type { room } from "@/prisma/generated";
import { getRoomsAction } from "@/features/room/application/actions/room.actions";

export const useRoomData = () => {
  const [data, setData] = useState<room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await getRoomsAction();
      
      if (result.success && result.data) {
        setData(result.data);
        setError(null);
      } else {
        setError(new Error(result.error || "Failed to fetch rooms"));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return {
    data,
    isLoading,
    error,
    mutate: loadData,
  };
};
