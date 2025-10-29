"use client";

import { useState, useEffect } from "react";
import type { teacher } from "@/prisma/generated";
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions";

export const useTeacherData = () => {
  const [data, setData] = useState<teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await getTeachersAction();
      
      if (result.success && result.data) {
        setData(result.data);
        setError(null);
      } else {
        setError(new Error(result.error || "Failed to fetch teachers"));
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
    mutate: loadData, // Provide mutate for re-fetching
  };
};
