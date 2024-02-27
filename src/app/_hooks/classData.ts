import useSWR, { preload } from "swr"
import type { class_schedule } from "@prisma/client"
import { fetcher } from "@/libs/axios"

export const useClassData = (AcademicYear: number, Semester: number, TeacherID?: number, GradeID?: string) => {
  let path = `/class?AcademicYear=${AcademicYear}&Semester=SEMESTER_${Semester}`
  if (GradeID) {
    path += `&GradeID=${GradeID}`
  } else if (TeacherID) {
    path += `&TeacherID=${TeacherID}`
  }
  preload(path, fetcher)
  const { data, error, mutate, isValidating } = useSWR<class_schedule[]>(path, fetcher)

  return {
    data: data ?? [],
    isLoading: !error && !data,
    isValidating,
    error,
    mutate,
  }
}
