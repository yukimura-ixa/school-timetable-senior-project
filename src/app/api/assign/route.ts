import prisma from "@/libs/prisma"
import { NextRequest, NextResponse } from "next/server"
import { teachers_responsibility, semester } from "@prisma/client"
import { subjectCreditValues } from "@/models/credit-value"

export async function GET(request: NextRequest) {
  // localhost:3000/api/assign?TeacherID=1&Semester=SEMESTER_1&AcademicYear=2566

  const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))
  const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
  const Semester = semester[request.nextUrl.searchParams.get("Semester")]

  try {
    const data: teachers_responsibility[] = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: TeacherID,
        AcademicYear: AcademicYear,
        Semester: Semester,
      },
      include: {
        subject: true,
        gradelevel: true,
        teacher: true,
      },
    })


    const results = data.map((resp) => { return { ...resp, SubjectName: resp.subject.SubjectName, Credit: resp.subject.Credit } })
    return NextResponse.json(results)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const results = []

    const existingResponsibilities = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: body.TeacherID,
        AcademicYear: body.AcademicYear,
        Semester: body.Semester,
      },
    })

    const incomingResponsibilities = body.Resp
    const diff = existingResponsibilities.filter((resp) => !incomingResponsibilities.some((incoming) => incoming.RespID === resp.RespID))

    for (const resp of incomingResponsibilities) {
      if (!resp.RespID) {
        const newResp = await prisma.teachers_responsibility.create({
          data: {
            TeacherID: body.TeacherID,
            AcademicYear: body.AcademicYear,
            Semester: body.Semester,
            SubjectCode: resp.SubjectCode,
            GradeID: resp.GradeID,
            TeachHour: subjectCreditValues[resp.Credit] * 2,
          }
        })
        results.push({ created: newResp })
      }
    }

    for (const resp of diff) {
      const deletedResp = await prisma.teachers_responsibility.delete({
        where: {
          RespID: resp.RespID
        }
      })
      results.push({ deleted: deletedResp })
    }

    const deleteNoRespSchedule = await prisma.class_schedule.deleteMany({
      where: {
        timeslot: {
          AcademicYear: body.AcademicYear,
          Semester: semester[body.Semester]
        },
        teachers_responsibility: {
          every: {
            TeacherID: body.TeacherID,
            AcademicYear: body.AcademicYear,
            Semester: body.Semester,
          }
        }
      }
    })

    return NextResponse.json({ status: "success", results: results })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

