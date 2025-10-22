import prisma from "@/libs/prisma"
import { semester, type class_schedule, Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { safeParseInt } from "@/functions/parseUtils"
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling"

type ClassScheduleWithRelations = Prisma.class_scheduleGetPayload<{
  include: {
    teachers_responsibility: { include: { teacher: true } };
    subject: true;
    gradelevel: true;
    timeslot: true;
    room: true;
  }
}>;

export async function GET(request: NextRequest) {

    const AcademicYear = safeParseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]
    const hasTeacherID = request.nextUrl.searchParams.has("TeacherID")
    const hasGradeID = request.nextUrl.searchParams.has("GradeID")
    const GradeID = request.nextUrl.searchParams.get("GradeID")
    const TeacherID = safeParseInt(request.nextUrl.searchParams.get("TeacherID"))
    
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
    
    // Validate TeacherID if provided
    if (hasTeacherID && TeacherID === null) {
        return createErrorResponse(
            new Error("Invalid TeacherID"),
            "TeacherID must be a valid number",
            400
        )
    }
    
    let response: ClassScheduleWithRelations[]
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

        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("[API Error - /api/class GET]:", error)
        return createErrorResponse(error, "Failed to fetch class schedules", 500)
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        return NextResponse.json(body)
    } catch (error) {
        console.error("[API Error - /api/class POST]:", error)
        return createErrorResponse(error, "Failed to process class data", 500)
    }
}

