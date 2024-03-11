import prisma from "@/libs/prisma"
import { semester } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {

    try {
        const GradeID = request.nextUrl.searchParams.get("GradeID")
        const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
        const Semester = semester[request.nextUrl.searchParams.get("Semester")]
        const data = await prisma.program.findFirst({
            where: {
                Semester: Semester,
                gradelevel: {
                    some: {
                        GradeID: GradeID,
                    },
                },
                subject: {
                    some: {
                        teachers_responsibility: {
                            every: {
                                AcademicYear: AcademicYear,
                                Semester: Semester
                            }
                        }
                    }
                }
            },

            include: {
                subject: {
                    select: {
                        SubjectCode: true,
                        SubjectName: true,
                        Credit: true,
                        Category: true,
                        teachers_responsibility: {
                            select: {
                                AcademicYear: true,
                                Semester: true,
                                teacher: {
                                    select: {
                                        TeacherID: true,
                                        Prefix: true,
                                        Firstname: true,
                                        Lastname: true
                                    }
                                }

                            }
                        },
                    },
                }
            },

        })

        const subjects = data.subject.map((subject) => {
            let teachers = subject.teachers_responsibility.map((teacher) => {
                return {
                    AcademicYear: teacher.AcademicYear,
                    Semester: teacher.Semester,
                    TeacherID: teacher.teacher.TeacherID,
                    Name: `${teacher.teacher.Prefix}${teacher.teacher.Firstname} ${teacher.teacher.Lastname}`
                }
            })
            return {
                SubjectCode: subject.SubjectCode,
                SubjectName: subject.SubjectName,
                Credit: subject.Credit,
                Category: subject.Category,
                teachers: teachers
            }
        })

        const response = {
            ProgramID: data.ProgramID,
            ProgramName: data.ProgramName,
            Semester: data.Semester,
            subjects: subjects

        }
        return NextResponse.json(response)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}