import useSWR from "swr"
import type { subject } from "@prisma/client"
import { fetcher } from "@/libs/axios"

export const useSubjectData = () => {
  const path = `/subject`
  const { data, error, mutate } = useSWR<subject[]>(path, fetcher, {
  })

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}
