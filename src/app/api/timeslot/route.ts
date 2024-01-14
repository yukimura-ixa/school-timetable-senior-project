import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"
import type { timeslot } from "@prisma/client"
import { day_of_week, breaktime } from "@prisma/client"

export async function GET(request: NextRequest) {
    // query: { TimeslotID }
    try {
        const data: timeslot[] = await prisma.timeslot.findMany({
            orderBy: {
                TimeslotID: "asc",
            },
        })
        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
        return NextResponse.error()
    }
}

export async function POST(request: NextRequest) {
    // body: { TimeslotPerDay, AcademicYear, Semester, Duration, BreakTimeslots, Days, StartTime}
    try {
        const body = await request.json()
        console.log(body)

        const timeslots: timeslot[] = []
        for (let day of body.Days) {
            for (let index = 0; index < body.TimeslotPerDay; index++) {
                let startTime = new Date(`1970-01-01T${body.StartTime}:00Z`)
                startTime.setMinutes(startTime.getMinutes() + (index + 1) * body.Duration)

                let endTime = new Date(startTime)
                endTime.setMinutes(endTime.getMinutes() + body.Duration)

                let isBreak: breaktime
                if (body.BreakTimeslots.Junior === index + 1 && body.BreakTimeslots.Senior === index + 1) {
                    isBreak = breaktime["BREAK_BOTH"]
                } else if (body.BreakTimeslots.Senior === index + 1) {
                    isBreak = breaktime["BREAK_SENIOR"]
                } else if (body.BreakTimeslots.Junior === index + 1) {
                    isBreak = breaktime["BREAK_JUNIOR"]
                } else {
                    isBreak = breaktime["NOT_BREAK"]
                }

                timeslots.push({
                    TimeslotID: body.Semester[9] + '/' + body.AcademicYear + '-' + day_of_week[day] + (index + 1),
                    DayOfWeek: day_of_week[day],
                    AcademicYear: body.AcademicYear,
                    Semester: body.Semester,
                    StartTime: startTime,
                    EndTime: endTime,
                    Breaktime: isBreak,
                })
            }
        }

        const data = await prisma.timeslot.createMany({
            data: timeslots,
        })

        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
        return NextResponse.error()
    }
}


export async function PUT(request: NextRequest) {
    // body: { TimeslotPerDay, AcademicYear, Semester, StartTime, EndTime, Breaktime }
    try {
        const body = await request.json()
        const data = await Promise.all(
            Array.from({ length: body.TimeslotPerDay }, (_, index) =>
                prisma.timeslot.update({
                    where: {
                        TimeslotID: body.Semester + '-' + body.AcademicYear + '-' + (index + 1),
                    },
                    data: {
                        AcademicYear: body.AcademicYear,
                        Semester: body.Semester,
                        StartTime: body.StartTime,
                        EndTime: body.EndTime,
                        Breaktime: body.Breaktime,
                    },
                })
            )
        )

        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
        return NextResponse.error()
    }
}
