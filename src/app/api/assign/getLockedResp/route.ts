import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"
import { teachers_responsibility, semester, subject } from "@prisma/client"

export async function GET(request: NextRequest) {
    // localhost:3000/api/assign/all&Semester=SEMESTER_1&AcademicYear=2566
    try {
        const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
        const Semester = semester[request.nextUrl.searchParams.get("Semester")]
        const TeacherIDs = request.nextUrl.searchParams.getAll("TeacherID").map((id) => parseInt(id))
        const data: teachers_responsibility[] = await prisma.teachers_responsibility.findMany({
            where: {
                AcademicYear: AcademicYear,
                Semester: Semester,
                TeacherID: {
                    in: TeacherIDs
                }
            },
            include: {
                subject: true,
                gradelevel: true,
                teacher: true,
            },
        })

        const subjectsOfTeacher = []
        for (const id of TeacherIDs) {
            // แยก subjects ของแต่ละครู
            const subjects = data.filter((item) => item.TeacherID === id).map((item) => {
                const { subject, RespID } = item
                return subject
            })
            subjectsOfTeacher.push(subjects)
        }

        const intersect = (arr1: subject[], arr2: subject[]) => {
            return arr1.filter((value) => {
                return arr2.some((item) => {
                    return item.SubjectCode === value.SubjectCode
                })
            })
        }


        let intersectedSubjects = []
        if (TeacherIDs.length === 1) intersectedSubjects = subjectsOfTeacher[0]
        for (let i = 0; i < subjectsOfTeacher.length - 1; i++) {

            const intersected = intersect(subjectsOfTeacher[i], subjectsOfTeacher[i + 1])
            if (i === 0) {
                intersectedSubjects = intersected
            } else {
                intersectedSubjects = intersect(intersectedSubjects, intersected)
            }
        }

        const response = intersectedSubjects.map((item) => {
            const RespIDs = data.filter((resp) => resp.subject.SubjectCode === item.SubjectCode).map((resp) => resp.RespID)
            return { ...item, RespIDs }
        })



        return NextResponse.json(response)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}