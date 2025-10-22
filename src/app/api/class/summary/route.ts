import prisma from "@/libs/prisma"
import { semester, type class_schedule } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { safeParseInt } from "@/functions/parseUtils"
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {

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
        console.error("[API Error - /api/class/summary GET]:", error)
        return createErrorResponse(error, "Failed to fetch class summary", 500)
    }
}