import useSWR from "swr"
import type { room } from "@prisma/client"
import { fetcher } from "@/libs/axios"

export const useRoomData = () => {
  const path = `/room`
  const { data, error, mutate } = useSWR<room[]>(path, fetcher, {
  })

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}
