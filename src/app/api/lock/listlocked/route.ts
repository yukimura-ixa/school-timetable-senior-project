import prisma from "@/libs/prisma"
import { semester } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { safeParseInt } from "@/functions/parseUtils"
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    // localhost:3000/api/lock/listlocked?Semester=SEMESTER_1&AcademicYear=2566
    const AcademicYear = safeParseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]
    
    // Validate required parameters
    const validation = validateRequiredParams({ AcademicYear })
    if (validation) return validation
    
    if (!Semester) {
        return createErrorResponse(
            new Error("Invalid semester"),
            "Semester parameter is required and must be valid",
            400
        )
    }
    
    try {

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
        console.error("[API Error - /api/lock/listlocked GET]:", error)
        return createErrorResponse(error, "Failed to list locked schedules", 500)
    }

}


