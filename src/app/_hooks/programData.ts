import useSWR, { preload } from "swr"
import type { program, gradelevel, subject } from "@/prisma/generated"
import { fetcher } from "@/libs/axios"

// Type for program with included relations
export type ProgramWithRelations = program & {
  gradelevel: gradelevel[]
  subject: subject[]
}

export const useProgramData = (gradeYear: string) => {
  const path = `/program?Year=${gradeYear}`
  preload(path, fetcher)
  const { data, error, mutate } = useSWR<ProgramWithRelations[]>(path, fetcher, {
  })

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}
