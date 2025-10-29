import useSWR, { preload } from "swr"
import type { timeslot } from "@/prisma/generated"
import { fetcher } from "@/libs/axios"

export const useTimeslotData = (academicYear: number, semester: number) => {
  preload(`/timeslot?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}`, fetcher)

  const path = `/timeslot?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}`
  const { data, error, mutate } = useSWR<timeslot[]>(path, fetcher)

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
} 
