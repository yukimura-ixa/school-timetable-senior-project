import useSWR from "swr"
import type { program } from "@prisma/client"
import { fetcher } from "@/libs/axios"

export const useProgramData = () => {
  const path = `/program`
  const { data, error, mutate } = useSWR<program[]>(path, fetcher, {
  })

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}
