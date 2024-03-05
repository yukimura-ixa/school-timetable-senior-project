import prisma from "@/libs/prisma"
import { semester, type class_schedule } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {

    const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]
    let response: class_schedule[]
    try {
        // localhost:3000/api/class/summary?AcademicYear=2566&Semester=SEMESTER_1
        response = await prisma.class_schedule.findMany({
            where: {
                timeslot: {
                    AcademicYear: AcademicYear,
                    Semester: Semester
                },
            },
            include: {
                subject: {
                    select: {
                        teachers_responsibility: {
                            select: {
                                TeacherID: true,
                            }
                        }
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