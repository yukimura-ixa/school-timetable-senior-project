import { semester } from "@prisma/client"

export type SemesterThai = {
    [key in semester]: string
}

export const semesterThai: SemesterThai = {
    [semester.SEMESTER_1]: "เทอม 1",
    [semester.SEMESTER_2]: "เทอม 2",
}