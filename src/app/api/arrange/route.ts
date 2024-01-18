import prisma from "@/libs/prisma"
import type { class_schedule } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))
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
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log(body)
        const response = Promise.all(body.map(async (item: class_schedule) => {
            // Check if GradeID exists in the referenced table
            const gradeExists = await prisma.gradelevel.findUnique({
                where: {
                    GradeID: item.GradeID
                }
            })
            if (!gradeExists) {
                throw new Error(`GradeID ${item.GradeID} does not exist`)
            }

            const data = await prisma.class_schedule.create({
                data: {
                    ClassID: item.TimeslotID + '-' + item.SubjectCode + '-' + item.GradeID,
                    SubjectCode: item.SubjectCode,
                    GradeID: item.GradeID,
                    TimeslotID: item.TimeslotID,
                    RoomID: item.RoomID || null
                },
            })
            console.log(data)
            return data
        }))
        return NextResponse.json(response)
    } catch (error) {
        console.log(error)
        return NextResponse.error()
    }
}