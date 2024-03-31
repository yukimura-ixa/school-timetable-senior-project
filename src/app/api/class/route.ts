import prisma from "@/libs/prisma"
import { semester, type class_schedule } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {

    const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]
    const hasTeacherID = request.nextUrl.searchParams.has("TeacherID")
    const hasGradeID = request.nextUrl.searchParams.has("GradeID")
    const GradeID = request.nextUrl.searchParams.get("GradeID")
    const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))
    let response: class_schedule[]
    try {
        if (hasTeacherID) {
            // localhost:3000/api/class?AcademicYear=2566&Semester=SEMESTER_1&TeacherID=1

            response = await prisma.class_schedule.findMany({
                where: {
                    timeslot: {
                        AcademicYear: AcademicYear,
                        Semester: Semester
                    },
                    teachers_responsibility: {
                        some: {
                            TeacherID: TeacherID
                        }
                    }
                },
                include: {
                    teachers_responsibility: true,
                    subject: true,
                    gradelevel: true,
                    timeslot: true,
                    room: true,
                },

            })
        } else if (hasGradeID) {
            // localhost:3000/api/class?AcademicYear=2566&Semester=SEMESTER_1&GradeID=101

            response = await prisma.class_schedule.findMany({
                where: {
                    timeslot: {
                        AcademicYear: AcademicYear,
                        Semester: Semester
                    },
                    GradeID: GradeID
                },
                include: {
                    teachers_responsibility: {
                        include: {
                            teacher: true
                        }
                    },
                    subject: true,
                    gradelevel: true,
                    timeslot: true,
                    room: true,
                },

            })

            response = response.map((item) => ({ ...item, teachers: item.teachers_responsibility.map((item) => item.teacher) }))

        } else {
            // localhost:3000/api/class?AcademicYear=2566&Semester=SEMESTER_1
            response = await prisma.class_schedule.findMany({
                where: {
                    timeslot: {
                        AcademicYear: AcademicYear,
                        Semester: Semester
                    },
                },
                include: {
                    subject: {
                        include: {
                            teachers_responsibility: true
                        }
                    },
                    gradelevel: true,
                    timeslot: true,
                    room: true,
                },

            })

        }

        return NextResponse.json(response)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        return NextResponse.json(body)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

