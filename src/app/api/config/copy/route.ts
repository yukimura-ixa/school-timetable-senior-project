import { semester } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        // console.log(body)
        const [fromSemester, fromAcademicYear] = body.from.split("/")
        const [toSemester, toAcademicYear] = body.to.split("/")

        const fromConfig = await prisma.table_config.findUnique({
            where: {
                ConfigID: body.from
            }
        })

        await prisma.table_config.create({
            data: {
                ConfigID: body.to,
                Semester: semester["SEMESTER_" + toSemester],
                AcademicYear: parseInt(toAcademicYear),
                Config: fromConfig.Config
            }
        }).then(async () => {

            if (body.assign) {

                const fromResp = await prisma.teachers_responsibility.findMany({
                    where: {
                        AcademicYear: parseInt(fromAcademicYear),
                        Semester: semester["SEMESTER_" + fromSemester]
                    }

                })
                const toResp = fromResp.map((item) => {
                    const newResp = {
                        TeacherID: item.TeacherID,
                        GradeID: item.GradeID,
                        SubjectCode: item.SubjectCode,
                        TeachHour: item.TeachHour,
                        AcademicYear: parseInt(toAcademicYear),
                        Semester: semester["SEMESTER_" + toSemester]
                    }

                    return newResp
                })

                for (const item of toResp) {
                    const check = await prisma.teachers_responsibility.findFirst({
                        where: item
                    })
                    if (check) {
                        throw new Error("มีการมอบหมายซ้ำกัน")
                    }
                }

                await prisma.teachers_responsibility.createMany({
                    data: toResp,
                    skipDuplicates: true
                })
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

                    await prisma.class_schedule.createMany({
                        data: toLock,
                        skipDuplicates: true
                    })
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

                    await prisma.class_schedule.createMany({
                        data: toTimetable,
                        skipDuplicates: true
                    })
                    console.log(toTimetable)
                }
            }
        })



        return NextResponse.json({ message: "success" })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}