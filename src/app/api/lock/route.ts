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

        // ดึงข้อมูลคาบเรียนที่มีซ้ำ
        const data = await prisma.class_schedule.findMany({
            where: {
                timeslot: {
                    AcademicYear: AcademicYear,
                    Semester: Semester,
                },
                IsLocked: true,
                // subject: {
                //     teachers_responsibility: {
                //         every: {
                //             TeacherID: TeacherID,
                //         },
                //     },
                // },
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

export async function POST(request: NextRequest) {

    try {
        let created = []
        const body = await request.json()
        console.log(body)
        const RespIDs = body.subject.RespIDs.map((id) => { return { RespID: id } }).flat(1)
        for (const timeslot in body.timeslots) {
            for (const grade in body.GradeIDs) {
                const data = await prisma.class_schedule.create({
                    data: {
                        ClassID: body.timeslots[timeslot] + '-' + body.SubjectCode + '-' + body.GradeIDs[grade],
                        IsLocked: true,
                        teachers_responsibility: {
                            connect: RespIDs,
                        },
                        subject: {
                            connect: {
                                SubjectCode: body.SubjectCode,
                            },
                        },
                        timeslot: {
                            connect: {
                                TimeslotID: body.timeslots[timeslot],
                            },
                        },
                        room: {
                            connect: {
                                RoomID: body.room.RoomID,
                            },
                        },
                        gradelevel: {
                            connect: {
                                GradeID: body.GradeIDs[grade],
                            },
                        },
                    }
                })
                created.push(data)
            }
        }

        return NextResponse.json(created)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const deleted = await prisma.class_schedule.deleteMany({
            where: {
                ClassID: {
                    in: body,
                },
            },
        })

        return NextResponse.json(body)

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })

    }
}


