import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"
import { semester } from "@prisma/client"

export async function GET(request: NextRequest) {
    // localhost:3000/api/assign/getAvailableResp?TeacherID=1&Semester=SEMESTER_1&AcademicYear=2566
    try {
        const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))
        const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
        const Semester = semester[request.nextUrl.searchParams.get("Semester")]
        const data = await prisma.teachers_responsibility.findMany({
            where: {
                TeacherID: TeacherID,
                AcademicYear: AcademicYear,
                Semester: Semester,
                subject: {
                    class_schedule: {
                        none: {}
                    }
                }
            },
            include: {
                subject: true,
                teacher: true,
                gradelevel: true,
            }
        })

        const results = data.map((resp) => { return { ...resp, SubjectName: resp.subject.SubjectName, Credit: resp.subject.Credit } })
        return NextResponse.json(results)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}