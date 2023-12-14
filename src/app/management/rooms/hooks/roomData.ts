import useSWR from "swr"
import type { room } from "@prisma/client"
import { fetcher } from "@/libs/axios"

export const useRoomData = () => {
  const path = `/rooms`
  const { data, error, mutate } = useSWR<room[]>(path, fetcher, {
    refreshInterval: 10000,
  })

  return {
    tableData: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}
