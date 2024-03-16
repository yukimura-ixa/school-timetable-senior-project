import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"
import { semester } from "@prisma/client"



export async function GET(request: NextRequest) {
    // localhost:3000/api/assign/getAvailableResp?TeacherID=1&Semester=SEMESTER_1&AcademicYear=2566
    try {
        const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))
        const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
        const Semester = semester[request.nextUrl.searchParams.get("Semester")]
        const data = await prisma.teachers_responsibility.findMany({
            where: {
                TeacherID: TeacherID,
                AcademicYear: AcademicYear,
                Semester: Semester,
                // class_schedule: {
                //     some: {
                //         IsLocked: false
                //     }
                // }
            },
            include: {
                subject: true,
                teacher: true,
                gradelevel: true,
                class_schedule: true
            }

        })

        data.map((resp) => {
            return {
                ...resp,
                count: resp.class_schedule.length
            }
        })

        const subjectsBox = []
        for (const resp of data) {
            let loopCredit = resp.TeachHour - resp.class_schedule.length
            for (let i = 0; i < loopCredit; i++) {
                subjectsBox.push(resp)
            }
        }
        // console.log(subjectsBox)

        // const countSchedule = await prisma.class_schedule.findMany({

        //     distinct: ['TimeslotID'],
        //     select: {
        //         _count: {
        //             select: {
        //                 teachers_responsibility: {
        //                     where: {
        //                         TeacherID: TeacherID,
        //                         AcademicYear: AcademicYear,
        //                         Semester: Semester,
        //                         RespID: {
        //                             in: subjectsBox.map((resp) => resp.RespID)
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // })



        // console.log(data)
        const results = subjectsBox.map((resp, index) => { return { ...resp, SubjectName: resp.subject.SubjectName, itemID: index + 1 } })
        return NextResponse.json(results)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}