import prisma from "@/libs/prisma"
import { semester, subject } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const GradeID = request.nextUrl.searchParams.get("GradeID")
    const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]

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
                    include: {
                        subject: {
                            include: {
                                teachers_responsibility: {
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
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}