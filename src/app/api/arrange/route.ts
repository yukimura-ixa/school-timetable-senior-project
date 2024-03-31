import prisma from "@/libs/prisma"
import { semester, type class_schedule } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))
    try {
        const data: class_schedule[] = await prisma.class_schedule.findMany({
            where: {
                subject: {
                    teachers_responsibility: {
                        every: {
                            TeacherID: TeacherID
                        }
                    }
                }
            },
            include: {
                subject: true,
                gradelevel: true,
                timeslot: true,
                room: true,
            },

        })
        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { TeacherID, AcademicYear, Semester, Schedule } = await request.json()
        console.log(TeacherID, Schedule)
        let response = { deleted: [], added: [] }

        // Fetch all existing schedules for the teacher
        const existing = await prisma.class_schedule.findMany({
            where: {
                IsLocked: false,
                timeslot: {
                    AcademicYear: AcademicYear,
                    Semester: semester[Semester]
                },
                teachers_responsibility: {
                    some: {
                        TeacherID: TeacherID
                    }
                }

            }
        })

        // return NextResponse.json(existing)

        // Create a map for quicker lookup of existing schedules by TimeslotID
        const existingMap = new Map(existing.map(schedule => [schedule.TimeslotID, schedule]))

        for (const schedule of Schedule) {
            if (schedule.subject.IsLocked) continue

            const existingSchedule = existingMap.get(schedule.TimeslotID)

            if (Object.keys(schedule.subject).length == 0) {
                //ถ้าช่องว่าง
                if (existingSchedule) {
                    //ลบ Schedule ที่เคยมีในช่อง
                    const deletedSchedule = await prisma.class_schedule.delete({
                        where: {
                            ClassID: existingSchedule.ClassID
                        }
                    })
                    response['deleted'].push(deletedSchedule)
                }
            } else {
                //ถ้าช่องไม่ว่าง
                if (!schedule.subject.ClassID) {
                    // ลากวิชาใหม่มาลง
                    console.log('Add new subject')
                    const newSchedule = await prisma.class_schedule.create({
                        data: {
                            ClassID: schedule.TimeslotID + '-' + schedule.subject.SubjectCode + '-' + schedule.subject.GradeID,
                            TimeslotID: schedule.TimeslotID,
                            SubjectCode: schedule.subject.SubjectCode,
                            GradeID: schedule.subject.GradeID,
                            RoomID: schedule.subject.room.RoomID,
                            IsLocked: false,
                            teachers_responsibility: {
                                connect: {
                                    RespID: schedule.subject.RespID
                                }
                            }
                        }
                    })
                    response['added'].push(newSchedule)
                } else if (schedule.subject.timeslot.TimeslotID != schedule.TimeslotID) {
                    // ย้ายไป Timeslot ใหม่
                    console.log('Move to new Timeslot')
                    if (existingSchedule) {
                        //ลบ Schedule ที่เคยมีในช่องเดิม
                        console.log('Delete existing schedule')
                        const deletedSchedule = await prisma.class_schedule.delete({
                            where: {
                                ClassID: existingSchedule.ClassID
                            }
                        })
                        response['deleted'].push(deletedSchedule)
                    }


                    const newSchedule = await prisma.class_schedule.create({
                        data: {
                            ClassID: schedule.TimeslotID + '-' + schedule.subject.SubjectCode + '-' + schedule.subject.GradeID,
                            TimeslotID: schedule.TimeslotID,
                            SubjectCode: schedule.subject.SubjectCode,
                            GradeID: schedule.subject.GradeID,
                            RoomID: schedule.subject.room.RoomID,
                            IsLocked: false,
                            teachers_responsibility: {
                                connect: {
                                    RespID: schedule.subject.RespID
                                }
                            }
                        }
                    })
                    response['added'].push(newSchedule)
                }
            }
        }

        return NextResponse.json(response)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
