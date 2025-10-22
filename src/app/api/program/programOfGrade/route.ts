import prisma from "@/libs/prisma"
import { semester, subject } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { safeParseInt } from "@/functions/parseUtils"
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const GradeID = request.nextUrl.searchParams.get("GradeID")
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
    
    if (!GradeID) {
        return createErrorResponse(
            new Error("Missing GradeID"),
            "GradeID parameter is required",
            400
        )
    }

    try {
        // const data = await prisma.teachers_responsibility.findMany({
        //     where: {
        //         GradeID: GradeID,
        //         AcademicYear: AcademicYear,
        //         Semester: Semester
        //     },
        // })

        const data = await prisma.gradelevel.findUnique({
            where: {
                GradeID: GradeID
            },
            include: {
                program: {
                    where: {
                        Semester: Semester
                    },
                    include: {
                        subject: {
                            include: {
                                teachers_responsibility: {
                                    distinct: ['TeacherID'],
                                    where: {
                                        AcademicYear: AcademicYear,
                                        Semester: Semester
                                    },
                                    include: {
                                        teacher: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        let subjects = []

        for (const program of data.program) {
            program.subject.forEach((subject) => {
                const newSubject = {
                    SubjectCode: subject.SubjectCode,
                    SubjectName: subject.SubjectName,
                    Category: subject.Category,
                    Credit: subject.Credit,
                    teachers: subject.teachers_responsibility.map((item) => {
                        return {
                            AcademicYear: item.AcademicYear,
                            Semester: item.Semester,
                            TeacherID: item.TeacherID,
                            TeachHour: item.TeachHour,
                            TeacherFullName: item.teacher.Prefix + item.teacher.Firstname + " " + item.teacher.Lastname,
                        }
                    })
                }
                subjects.push(newSubject)
            })
        }

        const response = {
            GradeID: data.GradeID,
            Year: data.Year,
            Number: data.Number,
            subjects: subjects
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("[API Error - /api/program/programOfGrade GET]:", error)
        return createErrorResponse(error, "Failed to fetch program for grade", 500)
    }
}