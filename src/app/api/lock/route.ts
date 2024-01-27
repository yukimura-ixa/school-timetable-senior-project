import prisma from "@/libs/prisma"
import { semester, type class_schedule } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    // localhost:3000/api/lock?Semester=SEMESTER_1&AcademicYear=2566
    try {
        const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
        const Semester = semester[request.nextUrl.searchParams.get("Semester")]

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

        // ดึงข้อมูลคาบเรียนที่มีซ้ำ
        const data = await prisma.class_schedule.findMany({
            where: {
                TimeslotID: {
                    in: locked.map((lock) => lock.TimeslotID),
                },
                SubjectCode: {
                    in: locked.map((lock) => lock.SubjectCode),
                },
            },
            include: {
                room: true,
                timeslot: true,
                subject: {
                    select: {
                        SubjectName: true,
                        teachers_responsibility: {
                            distinct: ["TeacherID"],
                            select: {
                                teacher: true,
                            },
                        },
                    },
                },
            }
        })
        // จัดรูปแบบข้อมูล
        const result = data.map(({ ClassID, TimeslotID, SubjectCode, room, GradeID, timeslot, subject }) => ({
            ClassID,
            TimeslotID,
            SubjectCode,
            SubjectName: subject.SubjectName,
            room,
            GradeID,
            timeslot: timeslot,
            teachers: subject.teachers_responsibility.map(({ teacher }) => teacher),
        }))

        const groupedResult = result.reduce((acc, item) => {
            const { SubjectCode, SubjectName, teachers, room } = item

            if (!acc[SubjectCode]) {
                acc[SubjectCode] = {
                    SubjectCode,
                    SubjectName,
                    teachers,
                    room,
                    GradeIDs: [],
                    timeslots: [], // Initialize an empty array for timeslots
                    ClassIDs: [],
                }
            }

            // Check if the grade is already added for the subject
            const existingGradeID = acc[SubjectCode].GradeIDs.find(
                (gradeID) => gradeID === item.GradeID
            )

            if (!existingGradeID) {
                acc[SubjectCode].GradeIDs.push(item.GradeID)
            }


            // Check if the timeslot is already added for the subject
            const existingTimeslot = acc[SubjectCode].timeslots.find(
                (ts) => ts.TimeslotID === item.timeslot.TimeslotID
            )

            if (!existingTimeslot) {
                acc[SubjectCode].timeslots.push({ ...item.timeslot })
            }

            acc[SubjectCode].ClassIDs.push(
                item.ClassID,
            )

            return acc
        }, {})


        const groupedArray = Object.values(groupedResult)

        return NextResponse.json(groupedArray)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }

}


