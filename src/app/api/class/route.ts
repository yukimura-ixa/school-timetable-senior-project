import prisma from "@/libs/prisma"
import { semester, type class_schedule } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {

    const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]
    let response: class_schedule[]
    try {
        if (request.nextUrl.searchParams.has("TeacherID")) {
            // localhost:3000/api/class?AcademicYear=2566&Semester=SEMESTER_1&TeacherID=1
            const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))
            response = await prisma.class_schedule.findMany({
                where: {
                    timeslot: {
                        AcademicYear: AcademicYear,
                        Semester: Semester
                    },
                    subject: {
                        teachers_responsibility: {
                            every: {
                                TeacherID: TeacherID
                            }
                        }
                    }
                },
                include: {
                    subject: true,
                    gradelevel: true,
                    timeslot: true,
                    room: true,
                },

            })
        } else if (request.nextUrl.searchParams.has("GradeID")) {
            // localhost:3000/api/class?AcademicYear=2566&Semester=SEMESTER_1&GradeID=101
            const GradeID = request.nextUrl.searchParams.get("GradeID")
            response = await prisma.class_schedule.findMany({
                where: {
                    timeslot: {
                        AcademicYear: AcademicYear,
                        Semester: Semester
                    },
                    GradeID: GradeID
                },
                include: {
                    subject: true,
                    gradelevel: true,
                    timeslot: true,
                    room: true,
                },

            })
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
                    subject: true,
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

