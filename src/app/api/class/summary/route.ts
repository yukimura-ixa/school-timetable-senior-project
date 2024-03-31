import prisma from "@/libs/prisma"
import { semester, type class_schedule } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {

    const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]
    let response
    try {
        // localhost:3000/api/class/summary?AcademicYear=2566&Semester=SEMESTER_1

        response = await prisma.class_schedule.findMany({
            where: {
                timeslot: {
                    AcademicYear: AcademicYear,
                    Semester: Semester
                },
                NOT: {
                    teachers_responsibility: {
                        none: {}
                    }
                }


            },
            include: {
                teachers_responsibility: true,
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