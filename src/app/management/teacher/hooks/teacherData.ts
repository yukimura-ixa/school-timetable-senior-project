import useSWR from "swr";
import type { Teacher } from "../model/teacher";
import { fetcher } from "@/libs/axios";

export const useTeacherData = () => {
  const path = `/teacher`;
  const { data, error, mutate } = useSWR<Teacher[]>(path, fetcher, {
    refreshInterval: 10000,
  });

  return {
    teacherData: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
