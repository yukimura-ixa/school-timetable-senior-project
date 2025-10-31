import { semester } from "@/prisma/generated"

export type SemesterThai = {
    [semester: string]: string
}

export const semesterThai: SemesterThai = {
    [semester.SEMESTER_1]: "เทอม 1",
    [semester.SEMESTER_2]: "เทอม 2",
}
