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
    // body: { TimeslotPerDay, AcademicYear, Semester, Duration, Breaktime, Days}
    try {
        const body = await request.json()
        console.log(body)
        const data = await Promise.all(
            Array.from({ days: body.Days }, (day: day_of_week, index) =>
                Array.from({ length: body.TimeslotPerDay }, (_, index) =>
                    prisma.timeslot.create({
                        data: {
                            TimeslotID: body.Semester + '/' + body.AcademicYear + '-' + day_of_week[day] + (index + 1),
                            DayOfWeek: day_of_week[day],
                            AcademicYear: body.AcademicYear,
                            Semester: body.Semester,
                            StartTime: body.StartTime,
                            EndTime: body.EndTime,
                            Breaktime: breaktime[body.Breaktime],
                        },
                    })
                )
            ))

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
