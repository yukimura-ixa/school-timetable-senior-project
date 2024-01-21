import useSWR, { preload } from "swr"
import type { timeslot } from "@prisma/client"
import { fetcher } from "@/libs/axios"

export const useTimeslotData = (academicYear: number, semester: string) => {
  preload(`/timeslot`, fetcher)

  const path = `/timeslot?AcademicYear=${academicYear}&Semester=${semester}`
  const { data, error, mutate } = useSWR<timeslot[]>(path, fetcher)

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
} 
