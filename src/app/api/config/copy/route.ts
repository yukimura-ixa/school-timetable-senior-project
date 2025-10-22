import { semester } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/libs/prisma"
import { safeParseInt } from "@/functions/parseUtils"
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling"

export const dynamic = 'force-dynamic'
// TODO: Optimize queries
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log("copying")
        console.time("copying")
        
        // Validate body structure
        if (!body.from || !body.to) {
            return createErrorResponse(
                new Error("Missing required parameters"),
                "Both 'from' and 'to' parameters are required",
                400
            )
        }
        
        const [fromSemester, fromAcademicYear] = body.from.split("/")
        const [toSemester, toAcademicYear] = body.to.split("/")
        
        // Parse and validate academic years
        const parsedFromYear = safeParseInt(fromAcademicYear)
        const parsedToYear = safeParseInt(toAcademicYear)
        
        const validation = validateRequiredParams({
            fromAcademicYear: parsedFromYear,
            toAcademicYear: parsedToYear
        })
        if (validation) return validation
        
        // Validate semesters
        if (!fromSemester || !toSemester) {
            return createErrorResponse(
                new Error("Invalid semester format"),
                "Semester values must be specified in the 'from' and 'to' parameters",
                400
            )
        }

        const fromConfig = await prisma.table_config.findUnique({
            where: {
                ConfigID: body.from
            }
        })

        await prisma.table_config.create({
            data: {
                ConfigID: body.to,
                Semester: semester["SEMESTER_" + toSemester],
                AcademicYear: parsedToYear,
                Config: fromConfig.Config
            }
        }).then(async () => {
            const fromSlots = await prisma.timeslot.findMany({
                where: {
                    AcademicYear: parsedFromYear,
                    Semester: semester["SEMESTER_" + fromSemester]
                }
            })

            const toSlots = fromSlots.map((item) => {
                const newSlot = {
                    ...item,
                    AcademicYear: parsedToYear,
                    Semester: semester["SEMESTER_" + toSemester],
                    TimeslotID: item.TimeslotID.replace(body.from, body.to)
                }

                return newSlot
            })

            await prisma.timeslot.createMany({
                data: toSlots,
                skipDuplicates: true
            })

            console.log("timeslot success")


            if (body.assign) {

                const fromResp = await prisma.teachers_responsibility.findMany({
                    where: {
                        AcademicYear: parsedFromYear,
                        Semester: semester["SEMESTER_" + fromSemester]
                    }

                })
                const toResp = fromResp.map((item) => {
                    const newResp = {
                        TeacherID: item.TeacherID,
                        GradeID: item.GradeID,
                        SubjectCode: item.SubjectCode,
                        TeachHour: item.TeachHour,
                        AcademicYear: parsedToYear,
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

                const newResp = await prisma.teachers_responsibility.findMany({
                    where: {
                        AcademicYear: parsedToYear,
                        Semester: semester["SEMESTER_" + toSemester]
                    }
                })

                console.log("assign success")

                if (body.lock) {
                    const fromLock = await prisma.class_schedule.findMany({
                        where: {
                            IsLocked: true,
                            timeslot: {
                                AcademicYear: parsedFromYear,
                                Semester: semester["SEMESTER_" + fromSemester]
                            }
                        },
                        include: {
                            teachers_responsibility: true
                        }
                    })
                    const toLock = fromLock.map((item) => {
                        const newTimeslotID = item.TimeslotID.replace(body.from, body.to)
                        const newClassID = item.ClassID.replace(body.from, body.to)
                        const newRespIDs = newResp.filter((resp) => {
                            return resp.Semester === semester["SEMESTER_" + toSemester] &&
                                resp.GradeID === item.GradeID &&
                                resp.SubjectCode === item.SubjectCode
                        })

                        return {
                            ...item,
                            ClassID: newClassID,
                            TimeslotID: newTimeslotID,
                            teachers_responsibility: {
                                connect: newRespIDs.map((item) => {
                                    return {
                                        RespID: item.RespID
                                    }
                                })
                            }
                        }
                    })

                    console.table(toLock)

                    const lockSuccess = await Promise.all(toLock.map(async (item) => {
                        try {
                            const newSchedule = await prisma.class_schedule.create({
                                data: item,
                                include: { teachers_responsibility: true }
                            })

                            return true

                        } catch (error) {
                            return false
                        }


                    }))

                    console.log("lock success", lockSuccess)
                }

                if (body.timetable) {
                    const fromTimetable = await prisma.class_schedule.findMany({
                        where: {
                            IsLocked: false,
                            timeslot: {
                                AcademicYear: parsedFromYear,
                                Semester: semester["SEMESTER_" + fromSemester]
                            }
                        },
                        include: {
                            teachers_responsibility: true
                        }
                    })

                    const toTimetable = fromTimetable.map((item) => {
                        const newTimeslotID = item.TimeslotID.replace(body.from, body.to)
                        const newClassID = item.ClassID.replace(body.from, body.to)
                        const newRespIDs = newResp.filter((resp) => {
                            return resp.Semester === semester["SEMESTER_" + toSemester] &&
                                resp.GradeID === item.GradeID &&
                                resp.SubjectCode === item.SubjectCode
                        })

                        return {
                            ...item,
                            ClassID: newClassID,
                            TimeslotID: newTimeslotID,
                            teachers_responsibility: {
                                connect: newRespIDs.map((item) => {
                                    return {
                                        RespID: item.RespID
                                    }
                                })
                            }
                        }
                    })

                    console.table(toTimetable)

                    const timetableSuccess = await Promise.all(toTimetable.map(async (item) => {
                        try {
                            const newSchedule = await prisma.class_schedule.create({
                                data: item,
                                include: { teachers_responsibility: true }
                            })


                            return true

                        } catch (error) {
                            return false
                        }
                    }))

                    console.log("schedule success", timetableSuccess)
                }
            }
            console.timeEnd("copying")
        })


        console.log("copy success")
        return NextResponse.json({ message: "success" })

    } catch (error) {
        console.error("[API Error - /api/config/copy POST]:", error)
        return createErrorResponse(error, "Failed to copy configuration", 500)
    }
}

