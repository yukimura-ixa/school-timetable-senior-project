import { semester, type class_schedule } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/libs/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {

    const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]
    // const GradeID = request.nextUrl.searchParams.get("GradeID")
    const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))
    let response: class_schedule[]
    try {
        // localhost:3000/api/class/checkConflict?AcademicYear=2566&Semester=SEMESTER_1&GradeID=101

        response = await prisma.class_schedule.findMany({
            where: {
                timeslot: {
                    AcademicYear: AcademicYear,
                    Semester: Semester
                },
                // GradeID: GradeID,
                teachers_responsibility: {
                    some: {
                        Semester: Semester,
                        AcademicYear: AcademicYear,
                        NOT: {
                            TeacherID: TeacherID
                        }
                    },
                }

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

        return NextResponse.json(response)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}