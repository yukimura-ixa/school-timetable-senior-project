import useSWR, { preload } from "swr"
import { fetcher } from "@/libs/axios"
import type { LockScheduleExtended } from '@/types/lock-schedule';

export const useLockData = (academicYear: number, semester: number) => {
  const path = `/lock?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}`
  preload(path, fetcher)
  const { data, error, mutate } = useSWR<LockScheduleExtended[]>(path, fetcher)

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
} 
