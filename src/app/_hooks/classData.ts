import useSWR, { preload } from "swr"
import type { class_schedule } from "@prisma/client"
import { fetcher } from "@/libs/axios"

export const useTeacherData = () => {
  preload(`/class`, fetcher)

  const path = `/teacher`
  const { data, error, mutate } = useSWR<class_schedule[]>(path, fetcher)

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}
