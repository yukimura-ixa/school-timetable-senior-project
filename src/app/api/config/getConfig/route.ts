import { semester } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/libs/prisma"
import { safeParseInt } from "@/functions/parseUtils"
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const AcademicYear = safeParseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = request.nextUrl.searchParams.get("Semester")
    
    // Validate required parameters
    const validation = validateRequiredParams({ AcademicYear })
    if (validation) return validation
    
    if (!Semester || !semester[Semester]) {
        return createErrorResponse(
            new Error("Invalid semester"),
            "Semester parameter is required and must be valid",
            400
        )
    }
    
    try {

        const data = await prisma.table_config.findFirst({
            where: {
                AcademicYear: AcademicYear,
                Semester: semester[Semester]
            }
        })
        
        if (!data) {
            return createErrorResponse(
                new Error("Configuration not found"),
                "No configuration found for the specified academic year and semester",
                404
            )
        }
        
        return NextResponse.json(data)

    } catch (error) {
        console.error("[API Error - /api/config/getConfig GET]:", error)
        return createErrorResponse(error, "Failed to fetch configuration", 500)
    }
}