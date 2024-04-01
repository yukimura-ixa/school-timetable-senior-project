import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"
import { teachers_responsibility, semester, subject } from "@prisma/client"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    // localhost:3000/api/assign/getLockedResp&Semester=SEMESTER_1&AcademicYear=2566
    const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]
    try {
        const groupBy = await prisma.teachers_responsibility.groupBy({
            by: ["SubjectCode"],
            where: {
                AcademicYear: AcademicYear,
                Semester: Semester,
                // class_schedule: {
                //     none: {}
                // }
            },
        })

        console.log(groupBy)
        const subjects = await prisma.subject.findMany({
            distinct: ["SubjectCode"],
            where: {
                SubjectCode: {
                    in: groupBy.map((item) => item.SubjectCode)
                },
                teachers_responsibility: {
                    some: {
                        AcademicYear: AcademicYear,
                        Semester: Semester,
                        // class_schedule: {
                        //     none: {}
                        // }
                    }
                }
            },
            include: {
                teachers_responsibility: true
            }
        })


        // const responseSubjects = []
        // for (const subject of subjects) {
        //     const hasSameGrade = subject.teachers_responsibility.reduce((acc, curr) => {
        //         if (!acc[curr.GradeID]) {
        //             acc[curr.GradeID] = []
        //         }
        //         acc[curr.GradeID].push(curr)
        //         return acc
        //     }, {})

        //     const moreThanOneGrade = Object.keys(hasSameGrade).filter((key) => hasSameGrade[key].length > 1)
        //     // console.log(moreThanOneGrade)
        //     const hasSameTeacher = subject.teachers_responsibility.reduce((acc, curr) => {
        //         if (!acc[curr.TeacherID]) {
        //             acc[curr.TeacherID] = []
        //         }
        //         acc[curr.TeacherID].push(curr)
        //         return acc
        //     }, {})

        //     // console.log(hasSameTeacher)
        //     const moreThanOneTeacher = Object.keys(hasSameTeacher).filter((key) => hasSameTeacher[key].length > 1)
        //     // console.log(moreThanOneTeacher)
        //     if (moreThanOneGrade.length > 0) {
        //         responseSubjects.push(subject)
        //     }
        //     if (moreThanOneTeacher.length > 0) {
        //         responseSubjects.push(subject)
        //     }
        // }

        // const response = subjects.filter((item) => item.hasSameGrade === true)

        return NextResponse.json(subjects)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}