import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"
import { teachers_responsibility, semester, subject } from "@prisma/client"

// TODO: หา resp ที่มี TeacherID เหมือนกันทุกอัน
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
                    in: TeacherIDs,
                }
            },
            include: {
                subject: true,
                gradelevel: true,
                teacher: true,
            },
        })

        const subjectsWithoutDuplicate = new Set<string>()
        const subjects: subject[] = []
        data.forEach((item) => {
            if (!subjectsWithoutDuplicate.has(item.SubjectCode)) {
                subjectsWithoutDuplicate.add(item.SubjectCode)
                subjects.push(item.subject)
            }
        })

        return NextResponse.json(subjects)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}