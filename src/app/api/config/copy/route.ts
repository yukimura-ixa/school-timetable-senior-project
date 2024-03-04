import { semester } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log(body)
        const [fromSemester, fromAcademicYear] = body.from.split("/")
        const [toSemester, toAcademicYear] = body.to.split("/")
        if (body.assign) {
            const fromResp = await prisma.teachers_responsibility.findMany({
                where: {
                    AcademicYear: parseInt(fromAcademicYear),
                    Semester: semester["SEMESTER_" + fromSemester]
                }

            })
            const toResp = fromResp.map((item) => {
                return {
                    ...item,
                    AcademicYear: parseInt(toAcademicYear),
                    Semester: semester["SEMESTER_" + toSemester]
                }
            })

            // await prisma.teachers_responsibility.createMany({
            //     data: toResp
            // })
            if (body.lock) {
                const fromLock = await prisma.class_schedule.findMany({
                    where: {
                        IsLocked: true,
                        timeslot: {
                            AcademicYear: parseInt(fromAcademicYear),
                            Semester: semester["SEMESTER_" + fromSemester]
                        }
                    }
                })
                const toLock = fromLock.map((item) => {
                    const newTimeslotID = item.TimeslotID.replace(body.from, body.to)
                    const newClassID = item.ClassID.replace(body.from, body.to)

                    return {
                        ...item,
                        ClassID: newClassID,
                        TimeslotID: newTimeslotID,
                    }
                })

                // await prisma.class_schedule.createMany({
                //     data: toLock
                // })
                console.log(toLock)
            }

            if (body.timetable) {
                const fromTimetable = await prisma.class_schedule.findMany({
                    where: {
                        IsLocked: false,
                        timeslot: {
                            AcademicYear: parseInt(fromAcademicYear),
                            Semester: semester["SEMESTER_" + fromSemester]
                        }
                    }
                })
                const toTimetable = fromTimetable.map((item) => {
                    const newTimeslotID = item.TimeslotID.replace(body.from, body.to)
                    const newClassID = item.ClassID.replace(body.from, body.to)

                    return {
                        ...item,
                        ClassID: newClassID,
                        TimeslotID: newTimeslotID,
                    }
                })

                // await prisma.class_schedule.createMany({
                //     data: toTimetable
                // })
                console.log(toTimetable)
            }
        }



        return NextResponse.json(body)

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}