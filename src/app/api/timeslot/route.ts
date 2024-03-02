import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"
import type { timeslot } from "@prisma/client"
import { day_of_week, breaktime, semester } from "@prisma/client"

//TODO: เพิ่มลง table_config
export async function GET(request: NextRequest) {
    // search: { AcademicYear, Semester }
    // /timeslot?AcademicYear=2566&Semester=SEMESTER_2
    try {
        const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
        const Semester = semester[request.nextUrl.searchParams.get("Semester")]
        const data: timeslot[] = await prisma.timeslot.findMany({
            where: {
                AcademicYear: AcademicYear,
                Semester: Semester,
            },
        })

        // sort by day and slot
        data.sort((a, b) => {
            const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
            const dayA = days.indexOf(a.DayOfWeek)
            const dayB = days.indexOf(b.DayOfWeek)
            const slotA = parseInt((a.TimeslotID.split("-")[1]).substring(3))
            const slotB = parseInt((b.TimeslotID.split("-")[1]).substring(3))

            if (dayA === dayB) {
                if (slotA < slotB) return -1
                if (slotA > slotB) return 1
            }
            if (dayA < dayB) return -1
            if (dayA > dayB) return 1
            return 0

        })
        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {

    try {
        const body = await request.json()
        console.log(body)
        const isExist = await prisma.timeslot.findFirst({
            where: {
                AcademicYear: body.AcademicYear,
                Semester: body.Semester,
            },
        })
        if (isExist) {
            return NextResponse.json({ error: "Timeslot already exists" }, { status: 400 })
        }
        const saveConfig = await prisma.table_config.create({
            data: {
                ConfigID: body.Semester + '/' + body.AcademicYear,
                AcademicYear: body.AcademicYear,
                Semester: body.Semester,
                Config: body
            }
        })
        const timeslots: timeslot[] = []
        for (let day of body.Days) {
            let slotStart = new Date(`1970-01-01T${body.StartTime}:00Z`)
            for (let index = 0; index < body.TimeslotPerDay; index++) {

                if (body.MiniBreak.SlotNumber === index + 1 && body.HasMinibreak) {
                    slotStart.setUTCMinutes(slotStart.getUTCMinutes() + body.MiniBreak.Duration)
                }

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

                let endTime = new Date(slotStart)

                if (isBreak !== breaktime["NOT_BREAK"]) {
                    endTime.setUTCMinutes(endTime.getUTCMinutes() + body.BreakDuration)
                } else {
                    endTime.setUTCMinutes(endTime.getUTCMinutes() + body.Duration)
                }


                const newSlot: timeslot = {
                    TimeslotID: body.Semester[9] + '/' + body.AcademicYear + '-' + day_of_week[day] + (index + 1),
                    DayOfWeek: day_of_week[day],
                    AcademicYear: body.AcademicYear,
                    Semester: body.Semester,
                    StartTime: slotStart,
                    EndTime: endTime,
                    Breaktime: isBreak,
                }
                timeslots.push(newSlot)
                slotStart = new Date(endTime)
            }
        }

        const data = await prisma.timeslot.createMany({
            data: timeslots,
        })

        return NextResponse.json({ message: "Timeslots created" })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}


export async function DELETE(request: NextRequest) {
    // body: {AcademicYear, Semester }
    try {
        const body = await request.json()
        const data = await prisma.timeslot.deleteMany({
            where: {
                AcademicYear: body.AcademicYear,
                Semester: semester[body.Semester],
            },
        })

        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}
