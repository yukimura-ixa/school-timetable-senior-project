import prisma from "@/libs/prisma"
import { semester } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    // localhost:3000/api/lock?Semester=SEMESTER_1&AcademicYear=2566
    try {
        const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
        const Semester = semester[request.nextUrl.searchParams.get("Semester")]
        // const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))

        //วิชาไหนมีคาบเรียนซ้ำกันบ้าง
        const locked = await prisma.class_schedule.groupBy({
            by: ["TimeslotID", "SubjectCode"],
            where: {
                timeslot: {
                    AcademicYear: AcademicYear,
                    Semester: Semester,
                },

            },
            having: {
                GradeID: {
                    _count: {
                        gt: 1,
                    }
                },
            },
        })


        return NextResponse.json(locked)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }

}


