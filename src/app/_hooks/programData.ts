import useSWR, { preload } from "swr"
import type { program } from "@prisma/client"
import { fetcher } from "@/libs/axios"

export const useProgramData = (gradeYear: string) => {
  const path = `/program?Year=${gradeYear}`
  preload(path, fetcher)
  const { data, error, mutate } = useSWR<program[]>(path, fetcher, {
  })

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}
