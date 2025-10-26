import useSWR, { preload } from "swr"
import type { teachers_responsibility } from "@/prisma/generated"
import { fetcher } from "@/libs/axios"

export const useResponsibilityData = (TeacherID: number) => {
  preload(`/assign?TeacherID=${TeacherID}`, fetcher)

  const path = `/assign?TeacherID=${TeacherID}`
  const { data, error, mutate } = useSWR<teachers_responsibility[]>(path, fetcher)

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
} 
