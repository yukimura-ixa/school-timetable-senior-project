import useSWR, { preload } from "swr"
import { fetcher } from "@/libs/axios"

export const useLockData = (academicYear: number, semester: number) => {
  const path = `/lock?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}`
  preload(path, fetcher)
  const { data, error, mutate } = useSWR<any>(path, fetcher)

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
} 
